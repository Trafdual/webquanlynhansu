const mongoose = require('mongoose')

const chamcongSchema = new mongoose.Schema({
  ngaycham: { type: Date },
  giocheckin: { type: Date },
  giocheckOut: { type: Date },
  nhanvien: { type: mongoose.Schema.Types.ObjectId, ref: 'nhanvien' }
})

const chamcong = mongoose.model('chamcong', chamcongSchema)
module.exports = chamcong
