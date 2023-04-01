import { IUser } from '@common'
import { CookieOptions } from 'express'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import { config } from '../../config'

const signToken = (id: string) => {
	return jwt.sign({ id }, config.jwt.secret, {
		expiresIn: config.jwt.expires,
	})
}

export const createSendToken = async (user: IUser) => {
	const token = signToken(user._id.toString())

	const cookieOptions: CookieOptions = {
		expires: moment.utc().add(1, 'days').toDate(),
		httpOnly: true,
	}

	if (config.environment === 'production') cookieOptions.secure = true

	user.password = undefined

	return {
		token,
		cookieOptions,
		user,
	}
}
