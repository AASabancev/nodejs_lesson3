const express = require('express')
const router = express.Router()
const { products, skills } = require('../data.json')
const { config } = require('../config.json')
const nodemailer = require('nodemailer')

router.get('/', (req, res, next) => {
  res.render('pages/index', { title: 'Main page', products, skills, user: req.session.user })
})

router.post('/', (req, res, next) => {
  // требуем наличия имени, обратной почты и текста
  if (!req.body.name || !req.body.email || !req.body.text) {
    // если что-либо не указано - сообщаем об этом
    return res.json({ msg: 'Все поля нужно заполнить!', status: 'Error' })
  }
  // инициализируем модуль для отправки писем и указываем данные из конфига
  const transporter = nodemailer.createTransport(config.mail.smtp)
  const mailOptions = {
    from: config.mail.smtp.auth.user,
    to: config.mail.send_to,
    subject: config.mail.subject,
    text:
       req.body.text.trim().slice(0, 500) +
       `\n Отправитель: ${req.body.name} <${req.body.email}>`
  }
  // отправляем почту
  transporter.sendMail(mailOptions, function (error, info) {
    // если есть ошибки при отправке - сообщаем об этом
    if (error) {
      return res.json({
        msg: `При отправке письма произошла ошибка!: ${error}`,
        status: 'Error'
      })
    }
    res.json({ msg: 'Письмо успешно отправлено!', status: 'Ok' })
  })
})

module.exports = router
