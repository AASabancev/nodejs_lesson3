const createError = require('http-errors')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash');

const mainRouter = require('./routes/')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(flash());


app.use(
   session({
     secret: '5@@c>B>u;/f}h^y',
     key: 'lesson_3_session',
     cookie: {
       path: '/',
       httpOnly: true,
       maxAge: 10 * 60 * 100000
     },
     saveUninitialized: false,
     resave: false
   })
)

process.env.NODE_ENV === 'development'
  ? app.use(logger('dev'))
  : app.use(logger('short'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', mainRouter)

// catch 404 and forward to error handler
app.use((req, __, next) => {
  next(
    createError(404, `Ой, извините, но по пути ${req.url} ничего не найдено!`)
  )
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

app.listen(3000, () => {})
