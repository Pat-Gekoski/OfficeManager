const fs = require('fs')
const mongoose = require('mongoose')
const axios = require('axios')
const dotenv = require('dotenv')
const Account = require('../../models/accountModel')

dotenv.config({path: './config.env'})

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
)

mongoose.connect(DB).then(() => console.log('connection to the database was successful'))

const accounts = JSON.parse(fs.readFileSync(`${__dirname}/accounts.json`, 'utf-8'))

const importData = async () => {
	try {
		await Account.create(accounts)
		console.log("account data imported successfully")
	} catch (e) {
		console.log(e)
	}
	process.exit()
}

const deleteData = async () => {
	try {
		await Account.deleteMany()
		console.log('successfully deleted all account data')
	} catch (e) {
		console.log("was not able to delete data: ", e)
	}
	process.exit()
}

if (process.argv[2] === '--import'){
	importData()
} else {
	deleteData()
}