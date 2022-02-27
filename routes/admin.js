const formidable = require('formidable')
const express = require('express')
const fs = require('fs')
const path = require('path')
const dataJson = require("../data.json");
const {products,skills} = require("../data.json");
const chance = require('chance')();
const router = express.Router()

router.get('/', (req, res, next) => {
  // TODO: Реализовать, подстановку в поля ввода формы 'Счетчики'
  // актуальных значений из сохраненых (по желанию)
  res.render('pages/admin', { title: 'Admin page',  products, skills, error:req.query.error, success:req.query.success  })
})


const saveToJson = async (object) => {
  await fs.writeFileSync( path.join(process.cwd(), 'data.json'), JSON.stringify(dataJson), 'utf8');
}

router.post('/skills', (req, res, next) => {


  const fields = req.body;
  const valid = validSkills(fields)

  if (valid.err) {
    return res.redirect(`/admin/?error=${valid.status}`)
  }

  dataJson.skills[0].number = parseInt(fields.age);
  dataJson.skills[1].number = parseInt(fields.concerts);
  dataJson.skills[2].number = parseInt(fields.cities);
  dataJson.skills[3].number = parseInt(fields.years);

  if (!saveToJson(dataJson)) {
    req.flash('status', 'Ошибка сохранения счетчиков')
    return res.redirect('/admin/?error=Ошибка сохранения счетчиков');
  }

  req.flash('status', 'Счетчики успешно сохранены')
  return res.redirect('/admin/?success=Счетчики успешно сохранены');

})

router.post('/upload', (req, res, next) => {
  const form = new formidable.IncomingForm()
  const upload = path.join('./public', 'assets','img','products');

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload, {recursive: true});
  }

  form.parse(req, function (err, fields, files) {
    if (err) {
      return next(err)
    }

    const valid = validGood(fields, files)

    if (valid.err) {
      fs.unlinkSync(files.photo.filepath)
      req.flash('status', `Ошибка ${valid.status}`)
      return res.redirect(`/admin/?error=${valid.status}`)
    }

    const fileName = chance.string({ pool: 'qwertyuiopasdfghjklzxcvbnm', length: 15 }) + path.extname(files.photo.originalFilename);
    const filePath = path.join(process.cwd(), upload, fileName);

    fs.copyFile(files.photo.filepath, filePath, function (err) {
      if (err) {
        return res.redirect('/admin/?error=Ошибка добавления товара');
      }

      dataJson.products.push({
        "src":`./assets/img/products/${fileName}`,
        "name":fields.name,
        "price":fields.price
      })

      fs.unlink(files.photo.filepath,()=>{});

      if(!saveToJson(dataJson)){
        req.flash('status', 'Ошибка  добавления товара')
        return res.redirect('/admin/?error=Ошибка добавления товара');
      }
      req.flash('status', 'Товар добавлен')
      return res.redirect('/admin/?success=Товар добавлен');
    })
  })

})

const validGood = (fields, files) => {
  if (files.photo.name === '' || files.photo.size === 0) {
    return { status: 'Не загружено фото товара!', err: true }
  }
  if (!fields.name) {
    return { status: 'Не указано название товара!', err: true }
  }
  if (!fields.price) {
    return { status: 'Не указана цена товара!', err: true }
  }
  return { status: 'Ok', err: false }
}


const validSkills = (fields) => {
  if (!fields.age || fields.age < 1) {
    return { status: 'Не указан возраст!', err: true }
  }
  if (!fields.concerts || fields.concerts < 1) {
    return { status: 'Не указаны концерты!', err: true }
  }
  if (!fields.cities || fields.cities < 1) {
    return { status: 'Не указаны города!', err: true }
  }
  if (!fields.years || fields.years < 1) {
    return { status: 'Не указан опыт на сцене!', err: true }
  }
  return { status: 'Ok', err: false }
}


module.exports = router
