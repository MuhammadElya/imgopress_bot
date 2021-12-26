const User = require('../models/user')

module.exports = function handleQuit(ctx) {
  ctx.telegram.leaveChat(ctx.message.chat.id)
  ctx.leaveChat()

  User.remove(ctx.update.message.from.id)
}