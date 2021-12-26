const dotenv = require('dotenv').config({ path: `${__dirname}/../.env` })

const mongoose = require('mongoose')
const { Telegraf } = require('Telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const handleDocument = require('./handlers/handleDocument')
const handlePhotoInline = require('./handlers/handlePhotoInline')
const handleStart = require('./handlers/handleStart')
const handleQuit = require('./handlers/handleQuit')

mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.once('open', () => {
  console.log('mongoose connected')
})
mongoose.connection.on('error', err => {
  console.log('mongoose error', err)
})

bot.on('document', handleDocument)
bot.on('photo', handlePhotoInline)
bot.on('text', handleStart)
bot.on('start', handleStart)
bot.on('stop', handleQuit)

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))