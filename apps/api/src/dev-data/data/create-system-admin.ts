import mongoose from 'mongoose'
import User from '../../models/userModel'
import { config } from '../../../config'
import { ICreateUserInput, IUser, UserRoles } from '../../common'

const DB = config.db.connectionString.replace('<PASSWORD>', config.db.password)

mongoose.connect(DB).then(() => console.info('connection to the database was successful'))

const createSystemAdmin = async () => {
	await User.create<ICreateUserInput>({
		createdAt: new Date(),
		username: 'System Admin',
		email: 'patricgekoski@protonmail.com',
		role: UserRoles.SystemAdmin,
		password: 'Valiscool$1',
		passwordConfirm: 'Valiscool$1',
	})
}

createSystemAdmin()
