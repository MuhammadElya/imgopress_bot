const serviceMessages = require('../helpers/serviceMessages')

module.exports = function handlePhotoInline(ctx) {
  serviceMessages.inlineImage(ctx)
}