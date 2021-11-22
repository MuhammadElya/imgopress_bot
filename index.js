const dotenv = require('dotenv').config()
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const svgo = require('svgo')
const FormData = require('form-data')
const { Telegraf } = require('Telegraf')
const { exit } = require('process')
const bot = new Telegraf(process.env.BOT_TOKEN)

const allowedExtensions = { 
  'image/svg+xml': 'svg', 
  'image/png': 'png', 
  'image/jpeg': 'jpg'  
}

const isLimitExpired = async () => {
  let data;
  try {
    const req = await axios.post('https://squeezeimg.com/api/getinfo', `token=${process.env.SQUEEZEIMG_API_TOKEN}`)
    data = req.data
  } catch (error) {
    console.log(error)
  }
  return data.limit > data.used
}

bot.command('start', ctx => {
  bot.telegram.sendMessage(ctx.chat.id, `🌄 Привет, это бот Imgopress. Я умею оптимизировать картинки и уменьшать их размер

⤵️ Пришлите мне одно или несколько изображений в форматах svg, png или jpeg`, {
  })
})

bot.on('document', async (ctx) => {

  const source = ctx.message.document
  const sourceName = ctx.message.document.file_name
  const sourceSize = (ctx.message.document.file_size / 1024).toFixed(1)
  const sourceExtension = allowedExtensions[source.mime_type] || false
  let compressionProcess;

  if(!sourceExtension) {
    return ctx.reply('Похоже вы пытаетесь прислать что-то не похожее на картинку 🤡')
  }

  const tmpFileName = `${ctx.chat.id}-${source.file_id}.${sourceExtension}`

  try {

    const sourceData = await ctx.telegram.getFileLink(source.file_id)
    const sourceFile = await axios({
      url: sourceData.href,
      method: 'GET',
      responseType: 'arraybuffer'
    })

    if((sourceFile.headers['content-length'] / 1024 / 1024).toFixed(1) >= 10) {
      return ctx.reply('🔴 Вы пытаетесь загрузить слишком большое изображение, ограничение на один файл — 10 МБ')
    }

    if(sourceExtension === 'svg') {

      compressionProcess = svgo.optimize(sourceFile.data, {
        multipass: true,
      })

    } else {
      
      const checkLimit = await isLimitExpired()
      if(!checkLimit) {
         return ctx.reply('😒 Вы исчерпали лимит на оптимизацию картинок, подождите немного и попробуйте снова')
      }

      const queryData = new FormData();
      queryData.append('token', process.env.SQUEEZEIMG_API_TOKEN);
      queryData.append('file_name', tmpFileName);
      queryData.append('qlt', 71);
      queryData.append('method', 'compress');
      queryData.append('to', 'webp');
      queryData.append('file', sourceFile.data, { filename: tmpFileName });
      
      compressionProcess = await axios({
        url: 'https://api.squeezeimg.com/plugin',
        method: 'POST',
        data: queryData,
        responseType: 'arraybuffer',
        headers: { ...queryData.getHeaders() } 
      })
    }

    fs.writeFileSync(path.resolve(__dirname, tmpFileName), compressionProcess.data)

    const size = fs.statSync(tmpFileName).size
      
    const compressedSize = (size / 1024).toFixed(1)
    const compressedPercent = ((sourceSize - compressedSize) / sourceSize * 100).toFixed(1)

    await ctx.replyWithDocument(
      { 
        source: path.resolve(__dirname, tmpFileName),
        filename: sourceName 
      },
      { 
        caption: `✅ ${sourceSize} KB → ${compressedSize} KB (${compressedPercent}%)`, parse_mode: 'HTML'
      }
    )
    ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id)

    fs.rmSync(tmpFileName)

  } catch (error) {
    console.log(error)
  }

})

bot.on('photo', (ctx) => ctx.reply('🤡 Похоже вы пытаетесь прислать не svg файл'))

// bot.on('message', ctx => {
//   bot.telegram.sendMessage(ctx.chat.id, 'test')
// });

bot.command('quit', (ctx) => {
  ctx.telegram.leaveChat(ctx.message.chat.id)
  ctx.leaveChat()
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))