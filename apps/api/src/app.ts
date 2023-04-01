import express from 'express'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'

import { config } from '../config'

const app = express()
// set security headers
app.use(helmet())

if (config.environment === 'development') {
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

app.use(express.json({ limit: '10kb' }))
// cookie parser: reading data from a cookie
app.use(cookieParser())
// get urlencoded form data
app.use(express.urlencoded({ extended: true, limit: '1gb', parameterLimit: 5000 }))
// data sanitization against NoSQL query injection
app.use(mongoSanitize())
// data sanitization against XSS
app.use(xss())
// prevent parameter pollution
app.use(
	// place fields in the white list that you want to allow duplicate queries for - video 146
	hpp({ whitelist: [] }),
)

app.use((req: any, _, next) => {
	req.requestTime = new Date().toISOString()
	next()
})

export default app
