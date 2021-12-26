const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  user_id: Number,
  first_name: String,
  username: String,
  language_code: String,
  plan: Number,
  deleted: Boolean,
}, {
  timestamps: true
})

const User = mongoose.model('User', userSchema)

async function findOrCreate(data, plan = 1) {
  const user = await User.findOne({ user_id: data.id }).exec()
  if (!user) {
    return new User({
      ...data,
      plan,
      user_id: data.id,
      deleted: false,
    }).save()
  } else {
    return user;
  }
}
async function remove(user_id) {
  return await User.findOneAndUpdate({ user_id}, { $set: { deleted: true } }, { new: true }).exec()
}

module.exports = { User, findOrCreate, remove }