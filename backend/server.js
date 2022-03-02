const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('uncaughtException', err => {
	console.log(err)
	server.close(() => {
		process.exit(1)
	})
})

dotenv.config({ path: "./config.env" })
const app = require('./app')

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)

mongoose.connect(DB).then(conn => console.log("DB connection successfull"))

const PORT = process.env.PORT || 5001
const server = app.listen(PORT, () => console.log(`App running on port ${PORT}`))

process.on('unhandledRejection', err => {
	console.log(err)
	server.close(() => {
		process.exit(1)
	})
})


