const mongoose = require('mongoose')

const nhanvienSchema = new mongoose.Schema({
  manv: { type: String },
  hoten: { type: String },
  ngaysinh: { type: Date },
  gioitinh: { type: String },
  diachi: { type: String },
  sodienthoai: { type: String },
  email: { type: String },
  cccd: { type: String },
  chucvu: { type: String },
  chamcong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chamcong' }]
})

const nhanvien = mongoose.model('nhanvien', nhanvienSchema)
module.exports = nhanvien
