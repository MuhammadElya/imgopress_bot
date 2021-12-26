function notImage(ctx) {
  return ctx.reply('Похоже вы пытаетесь прислать что-то не похожее на картинку 🤡')
}
function imageIsTooLarge(ctx) {
  return ctx.reply('🔴 Вы пытаетесь загрузить слишком большое изображение, ограничение на один файл — 10 МБ')
}
function limitExpired(ctx) {
  return ctx.reply('😒 Вы исчерпали лимит на оптимизацию картинок этого формата, подождите немного и попробуйте снова')
}
function totalLimitExpired(ctx) {
  return ctx.reply('😒 Вы исчерпали лимит на оптимизацию картинок, подождите немного и попробуйте снова')
}
function inlineImage(ctx) {
  return ctx.reply('🤡 Пожалуйста, пришлите изображение как файл (без компрессии)')
}
function loading(ctx) {
  return ctx.reply('Оптимизирую...')
}
function unknownError(ctx) {
  return ctx.reply('Кажется, что-то пошло не так. Немного подождите и попробуйте еще раз')
}

module.exports = {
  notImage, imageIsTooLarge, limitExpired, totalLimitExpired, loading, unknownError, inlineImage
}