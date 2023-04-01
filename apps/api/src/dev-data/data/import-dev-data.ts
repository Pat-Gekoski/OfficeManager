import fs from 'fs'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Account from '../../models/accountModel'
import User from '../../models/userModel'
import { config } from '../../../config'
import { IAccount, ICreateAccountInput, ICreateUserInput, IUser, UserRoles } from '../../common'

const DB = config.db.connectionString.replace('<PASSWORD>', config.db.password)

mongoose.connect(DB).then(() => console.info('connection to the database was successful'))

const accounts = JSON.parse(fs.readFileSync(`${__dirname}/accounts.json`, 'utf-8'))
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))

const signUp = async (data: ICreateAccountInput & ICreateUserInput) => {
	const createdAt = data.createdAt ? new Date(data.createdAt) : new Date()

	const account: IAccount = await Account.create<ICreateAccountInput>({
		createdAt,
		accountName: data.accountName,
		accountOwnerName: data.accountOwnerName,
		accountOwnerEmail: data?.accountOwnerEmail,
		contactName: data?.contactName || undefined,
		contactNumber: data.contactNumber || undefined,
		contactEmail: data.contactEmail || undefined,
	})

	const accountAdmin: IUser = await User.create<ICreateUserInput>({
		createdAt,
		accountId: account._id,
		username: data.accountOwnerName,
		email: data.accountOwnerEmail,
		role: UserRoles.AccountAdmin,
		password: data.password,
		passwordConfirm: data.passwordConfirm,
	})
}

const importData = async () => {
	try {
		for (const account of accounts) {
			await signUp(account)
		}
		console.info('test data seeded....')
	} catch (e) {
		console.error('was not able to import data', e)
	}
	process.exit()
}

const deleteData = async () => {
	try {
		await Account.deleteMany()
		await User.deleteMany()
		console.info('data cleared...')
	} catch (e) {
		console.error('was not able to delete data: ', e)
	}
	process.exit()
}

if (process.argv[2] === '--import') {
	importData()
} else {
	deleteData()
}
