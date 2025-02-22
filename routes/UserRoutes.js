const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')

const User = require('../models/UserModel')
const NhanVien = require('../models/NhanVienModel')

router.post('/register', async (req, res) => {
  try {
    const { username, password, email, phone, role } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      username,
      password: hashedPassword,
      email,
      phone,
      role
    })
    await user.save()
    res.json(user)
  } catch (error) {
    console.error(error)
  }
})

router.post('/registernhanvien', async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      phone,
      hoten,
      ngaysinh,
      gioitinh,
      cccd,
      diachi,
      chucvu
    } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      username,
      password: hashedPassword,
      email,
      phone,
      role: 'nhanvien'
    })

    const nhanvien = new NhanVien({
      hoten,
      ngaysinh,
      gioitinh,
      diachi,
      sodienthoai: phone,
      email,
      cccd,
      chucvu
    })
    nhanvien.manv = 'NV' + nhanvien._id.toString().slice(-4)
    nhanvien.user = user._id
    await user.save()
    await nhanvien.save()
    res.json(user)
  } catch (error) {
    console.error(error)
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    if (!user) {
      res.json({ message: 'Tên đăng nhập không chính xác' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.json({ message: 'Mật khẩu không chính xác' })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
