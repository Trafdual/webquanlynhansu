const QRCode = require('qrcode')
const express = require('express')
const router = express.Router()
const NhanVien = require('../models/NhanVienModel')
const ChamCong = require('../models/ChamCongModel')
const QrChamCong = require('../models/QrChamCongModel')

const fs = require('fs')

const path = require('path')

const qrDir = path.join(__dirname, '../public/qrcodes')

if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true })
}

router.post('/qrcode/save', async (req, res) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ message: 'Thiếu URL để tạo QR' })

    fs.readdir(qrDir, (err, files) => {
      if (err) return res.status(500).json({ message: 'Lỗi đọc thư mục' })

      const nextFileNumber = files.length + 1
      const filePath = path.join(qrDir, `chamcong_${nextFileNumber}.png`)

      QRCode.toFile(filePath, url, async err => {
        if (err) return res.status(500).json({ message: 'Lỗi lưu QR' })
        const qr = new QrChamCong({
          image:
            'http://localhost:8080/qrcodes/chamcong_' + nextFileNumber + '.png'
        })
        await qr.save()
        res.json({ message: 'QR Code đã lưu', filePath })
      })
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi hệ thống' })
  }
})
router.get('/getqr', async (req, res) => {
  try {
    const qr = await QrChamCong.find().lean()
    res.json(qr)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi hệ thống' })
  }
})

router.post('/qrcode/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body 

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID không hợp lệ' })
    }

    const qrcodes = await QrChamCong.find({ _id: { $in: ids } })

    if (qrcodes.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy QR Code nào' })
    }

    qrcodes.forEach(qr => {
      const filePath = path.join(
        __dirname,
        '../public/qrcodes',
        path.basename(qr.image)
      )
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    })

    await QrChamCong.deleteMany({ _id: { $in: ids } })

    res.json({ message: `Đã xóa ${qrcodes.length} QR Code thành công` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi hệ thống' })
  }
})


router.post('/scan', async (req, res) => {
  try {
    const { manv } = req.body
    const nhanvien = await NhanVien.findOne({ manv })

    const fixedDate = new Date('2025-02-21T00:00:00Z') // Ngày cố định 21/2
    fixedDate.setHours(0, 0, 0, 0)

    let chamCong = await ChamCong.findOne({
      nhanvien: nhanvien._id,
      ngaycham: { $gte: fixedDate, $lt: new Date('2025-02-21T00:00:00Z') }
    })

    if (!chamCong) {
      chamCong = new ChamCong({
        nhanvien: nhanvien._id,
        ngaycham: fixedDate,
        giocheckin: new Date()
      })
      nhanvien.chamcong.push(chamCong._id)
      await nhanvien.save()
      await chamCong.save()
      return res.json({ data: 'http://localhost:3000/chamcongthanhcong' })
    }

    if (!chamCong.giocheckOut) {
      chamCong.giocheckOut = new Date()
      await chamCong.save()
      return res.json({ data: 'http://localhost:3000/chamcongthanhcong' })
    }

    return res.json({
      message: 'Ngày 21/2 đã check-in & check-out'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi hệ thống' })
  }
})



router.get('/getchamcong', async (req, res) => {
  try {
    const chamcong = await ChamCong.find().lean()
    res.json(chamcong)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi hệ thống' })
  }
})

router.post('/deletechamcong/:idchamcong', async (req, res) => {
  try {
    const idchamcong = req.params.idchamcong
    await ChamCong.findByIdAndDelete(idchamcong)
    res.json({ message: 'Xóa thanh cong' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi hệ thống' })
  }
})

router.get('/getchamcong/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    const nhanvien = await NhanVien.findOne({ user: userId })
    const chamcongjson = await Promise.all(
      nhanvien.chamcong.map(async cc => {
        const chamcong = await ChamCong.findById(cc._id)
        return {
          ngaycham: chamcong.ngaycham,
          giocheckin: chamcong.giocheckin,
          giocheckOut: chamcong.giocheckOut
        }
      })
    )
    res.json(chamcongjson)
  } catch (error) {
    console.error(error)
  }
})

router.get('/getchamcongadmin/:idnhanvien', async (req, res) => {
  try {
    const idnhanvien = req.params.idnhanvien
    const nhanvien = await NhanVien.findById(idnhanvien)
    const chamcongjson = await Promise.all(
      nhanvien.chamcong.map(async cc => {
        const chamcong = await ChamCong.findById(cc._id)
        return {
          ngaycham: chamcong.ngaycham,
          giocheckin: chamcong.giocheckin,
          giocheckOut: chamcong.giocheckOut
        }
      })
    )
    res.json(chamcongjson)
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
