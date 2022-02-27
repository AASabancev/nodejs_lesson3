const express = require('express')
const router = express.Router()
const { users } = require('../config.json')

router.get('/', (req, res, next) => {
  res.render('pages/login', { title: 'SigIn page', err: req.query.err })
})

router.post('/', (req, res, next) => {
  // TODO: Реализовать функцию входа в админ панель по email и паролю
  console.log('hello')

  if (!req.body.email || !req.body.password) {
    // если что-либо не указано - сообщаем об этом
    res.redirect('/login?err=Введите логин и пароль')
    return next();
  }

  const userFound = users.filter( user => {
    return user.login === req.body.email && user.password === req.body.password;
  }).shift();

  if(userFound) {
    req.session.user = {
      id: userFound.id,
      name: userFound.name,
    }
    res.redirect('/admin/')
  } else {
    res.redirect('/login?err=Пользователь не найден')
  }
})

router.get('/out', (req, res, next) => {
  req.session.user = null;
  res.redirect('/')
});

module.exports = router
