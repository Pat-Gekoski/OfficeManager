const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const accountsRouter = require('./routes/accountRoutes')
const usersRouter = require('./routes/userRoutes')
const adminRouter = require('./routes/adminRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express()

app.use(helmet()) // set security headers

// development logging
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'))
}

// limit requests from same IP
const limiter = rateLimit({
	max: 300,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP. Please try again in an hour',
	standardHeaders: true,
})

app.use(limiter)

// body parser: reading data from the body into req.body
app.use(express.json({limit: '10kb'}))
// cookie parser: reading data from a cookie
app.use(cookieParser())
// get urlencoded form data
app.use(express.urlencoded())

// data sanitization against NoSQL query injection
app.use(mongoSanitize())

// data sanitization against XSS
app.use(xss())

// prevent parameter pollution
// todo: place fields in the white list that you want to allow duplicate queries for - video 146
app.use(hpp({
	whitelist: []
}))

app.use((req, _, next) => {
   req.requestTime = new Date().toISOString()
   next()
})

app.use('/api/v1/accounts', accountsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/admin', adminRouter)

app.all('*', (req, _, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)

module.exports = app