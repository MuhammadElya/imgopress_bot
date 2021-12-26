const User = require('../models/user')

module.exports = async function handleStart(ctx) {
  ctx.telegram.sendMessage(ctx.chat.id, `🌄 Привет, это бот Imgopress. Я умею оптимизировать картинки и уменьшать их размер

⤵️ Пришлите мне одно или несколько изображений в форматах svg, png или jpeg`, {
  })

  User.findOrCreate(ctx.update.message.from)
}