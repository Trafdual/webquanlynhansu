const mongoose = require('mongoose')

const qrchamcongSchema = new mongoose.Schema({
  image: { type: String }
})

const qrchamcong = mongoose.model('qrchamcong', qrchamcongSchema)
module.exports = qrchamcong
