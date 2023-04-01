import { IUser } from '../../common'
import { CookieOptions } from 'express'
import { BaseService } from '../base-service'
import User from 'models/userModel'
import AppError from 'utils/appError'
import { createSendToken } from 'utils/token.utils'
import { setAllowedFields } from 'utils/allowedFields'

export default class UserService extends BaseService {
	constructor() {
		super()
	}

	public async updateMyPassword(
		userId: string,
		currentPassword: string,
		password: string,
		passwordConfirm: string,
	): Promise<{ token: string; cookieOptions: CookieOptions; user: IUser }> {
		const user = await User.findById(userId).select('+password')
		const passwordMatch = await user.correctPassword(currentPassword, user.password)

		if (!passwordMatch) {
			throw new AppError('Your current password is wrong', 401)
		}

		user.password = password
		user.passwordConfirm = passwordConfirm
		await user.save()

		const { token, cookieOptions, user: currentUser } = await createSendToken(user)

		return {
			token,
			cookieOptions,
			user: currentUser,
		}
	}

	public async updateMe(userId: string, params: any): Promise<IUser> {
		const filteredParams = setAllowedFields(params, 'username', 'email', 'photo')

		return await User.findByIdAndUpdate(userId, filteredParams, {
			new: true,
			runValidators: true,
		})
	}

	public async deleteMe(userId: string): Promise<void> {
		await User.findByIdAndUpdate(userId, { active: false })
	}
}
