const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')

const User = require('../models/UserModel')
const NhanVien = require('../models/NhanVienModel')
const ChamCong = require('../models/ChamCongModel')

router.get('/getnhanvien', async (req, res) => {
  try {
    const nhanvien = await NhanVien.find().lean()
    const nhanvienjson = await Promise.all(
      nhanvien.map(async nv => {
        const user = await User.findById(nv.user)
        return {
          ...nv,
          user
        }
      })
    )
    res.json(nhanvienjson)
  } catch (error) {
    console.error(error)
  }
})

router.post('/setrole/:idnhanvien', async (req, res) => {
  try {
    const idnhanvien = req.params.idnhanvien
    const { role } = req.body
    const nhanvien = await NhanVien.findById(idnhanvien)
    const user = await User.findById(nhanvien.user)
    user.role = role
    await user.save()
    res.json(nhanvien)
  } catch (error) {
    console.error(error)
  }
})

router.get('/getchitietnv/:idnhanvien', async (req, res) => {
  try {
    const idnhanvien = req.params.idnhanvien
    const nhanvien = await NhanVien.findById(idnhanvien)
    const user = await User.findById(nhanvien.user)
    const data = {
      nhanvien,
      user
    }
    res.json(data)
  } catch (error) {
    console.error(error)
  }
})

router.post('/updateNhanvien/:idnhanvien', async (req, res) => {
  try {
    const idnhanvien = req.params.idnhanvien
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
    const nhanvien = await NhanVien.findById(idnhanvien)

    const user = await User.findById(nhanvien.user)

    user.username = username
    user.email = email
    user.phone = phone
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      user.password = hashedPassword
    }

    nhanvien.hoten = hoten
    nhanvien.ngaysinh = ngaysinh
    nhanvien.gioitinh = gioitinh
    nhanvien.diachi = diachi
    nhanvien.sodienthoai = phone
    nhanvien.email = email
    nhanvien.cccd = cccd
    nhanvien.chucvu = chucvu

    await user.save()
    await nhanvien.save()
    res.json(nhanvien)
  } catch (error) {
    console.error(error)
  }
})

router.post('/deleteNhanvien', async (req, res) => {
  try {
    const { ids } = req.body
    for (const id of ids) {
      const nhanvien = await NhanVien.findById(id)
      await Promise.all(
        nhanvien.chamcong.map(async chamcong => {
          await ChamCong.findByIdAndDelete(chamcong._id)
        })
      )
      await User.findByIdAndDelete(nhanvien.user)
      await NhanVien.findByIdAndDelete(id)
    }
    res.json({ message: 'Xóa thành công' })
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
