const mongoose = require('mongoose')

const uploadSchema = mongoose.Schema({
  user_id: Number,
  file_type: String,
  source_size: Number,
  compressed_size: Number,
  compressed_percent: Number,
}, {
  timestamps: true
})

const Upload = mongoose.model('Upload', uploadSchema)

async function create(item) {
  return await new Upload(item).save()
}

async function findByUserId(user_id) {
  return await Upload.find({ user_id }).exec()
}

async function countLastByUserId(user_id, milliseconds) {
  const result = await Upload.find({
    user_id,
    createdAt: {
     $gte: new Date(Date.now() - milliseconds),
     //$lt: new Date()
    }
  }).exec()
  return result.length
}

module.exports = { Upload, findByUserId, countLastByUserId, create }