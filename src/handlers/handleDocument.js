const fs = require('fs')
const path = require('path')
const axios = require('axios')
const svgo = require('svgo')
const squeezeImg = require('../helpers/squeezeImg')
const serviceMessages = require('../helpers/serviceMessages')
const User = require('../models/user')
const Upload = require('../models/upload')

module.exports = async function handleDocument(ctx) {

  const allowedExtensions = { 
    'image/svg+xml': 'svg', 
    'image/png': 'png', 
    'image/jpeg': 'jpg'  
  }
  const currentUser = await User.findOrCreate(ctx.update.message.from)
  const currentUserId = currentUser.user_id
  
  const countLastFor24h = await Upload.countLastByUserId(currentUserId, 3600 * 60)

  if(countLastFor24h >= 100) {
    return serviceMessages.limit24Expired(ctx)
  }

  const loading = await serviceMessages.loading(ctx)

  const source = ctx.message.document
  const sourceName = ctx.message.document.file_name
  const sourceSize = (ctx.message.document.file_size / 1024).toFixed(1)
  const sourceExtension = allowedExtensions[source.mime_type] || false
  let compressionProcess;

  if(!sourceExtension) {
    ctx.telegram.deleteMessage(loading.chat.id, loading.message_id)
    return serviceMessages.notImage(ctx)
  }

  const tmpFileName = `${ctx.chat.id}-${source.file_id}.${sourceExtension}`
  const tmpPath = path.resolve(__dirname, '..') + '/tmp/'
  if (!fs.existsSync(tmpPath)) {
    fs.mkdirSync(tmpPath)
  }

  try {

    const sourceData = await ctx.telegram.getFileLink(source.file_id)
    const sourceFile = await axios({
      url: sourceData.href,
      method: 'GET',
      responseType: 'arraybuffer'
    })

    if((sourceFile.headers['content-length'] / 1024 / 1024).toFixed(1) >= 10) {
      ctx.telegram.deleteMessage(loading.chat.id, loading.message_id)
      return serviceMessages.imageIsTooLarge(ctx);
    }

    if(sourceExtension === 'svg') {

      compressionProcess = svgo.optimize(sourceFile.data)

    } else {
      
      const checkLimit = await squeezeImg.isLimitExpired()
      if(!checkLimit) {
        ctx.telegram.deleteMessage(loading.chat.id, loading.message_id)
        return serviceMessages.limitExpired(ctx)
      }
      
      compressionProcess = await squeezeImg.compress(sourceFile.data, tmpFileName)

    }

    fs.writeFileSync(tmpPath + tmpFileName, compressionProcess.data)

    const size = fs.statSync(tmpPath + tmpFileName).size
      
    const compressedSize = (size / 1024).toFixed(1)
    const compressedPercent = ((sourceSize - compressedSize) / sourceSize * 100).toFixed(1)

    ctx.telegram.deleteMessage(loading.chat.id, loading.message_id)
    ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id)

    await ctx.replyWithDocument({ 
        source: tmpPath + tmpFileName,
        filename: sourceName 
      }, { 
        caption: `✅ ${sourceSize} KB → ${compressedSize} KB (${compressedPercent}%)`, parse_mode: 'HTML'
      }
    )

    Upload.create({ 
      user_id: ctx.update.message.from.id,
      file_type: sourceExtension,
      source_size: sourceSize,
      compressed_size: compressedSize,
      compressed_percent: compressedPercent
    })

    fs.rmSync(tmpPath + tmpFileName)

  } catch (error) {
    console.log(error)
    ctx.telegram.deleteMessage(loading.chat.id, loading.message_id)
    return serviceMessages.unknownError(ctx)
  }
}
