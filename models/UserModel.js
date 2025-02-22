const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  email: { type: String },
  sodienthoai: { type: String },
  role: { type: String },
  nhanvien: { type: mongoose.Schema.Types.ObjectId, ref: 'nhanvien' }
})

const user = mongoose.model('user', userSchema)
module.exports = user
