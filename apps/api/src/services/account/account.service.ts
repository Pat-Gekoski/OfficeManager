import { Mongoose, Types } from 'mongoose'
import { BaseService } from 'services/base-service'
import Account from 'models/accountModel'
import User from 'models/userModel'
import { IAccount, ICreateAccountInput, IUser, UserRoles } from '../../common'
import { createSendToken } from 'utils/token.utils'
import { CookieOptions } from 'express'
import { setAllowedFields } from 'utils/allowedFields'

export default class AccountService extends BaseService {
	constructor(private readonly mongoose: Mongoose) {
		super()
	}

	public async signUp(
		input: ICreateAccountInput,
		password: string,
		passwordConfirm: string,
	): Promise<{ token: string; cookieOptions: CookieOptions; user: IUser; account: IAccount }> {
		const createdAt = input.createdAt ? new Date(input.createdAt) : new Date()
		const session = await this.mongoose.startSession()

		let account: IAccount, token: string, user: IUser, cookieOptions: CookieOptions

		try {
			await session.withTransaction(async () => {
				const newAccount = new Account({
					createdAt,
					accountName: input.accountName,
					accountOwnerName: input.accountOwnerName,
					accountOwnerEmail: input.accountOwnerEmail,
					contactName: input?.contactName,
					contactNumber: input?.contactNumber,
					contactEmail: input?.contactEmail,
				})

				await newAccount.save({ session })

				const accountAdmin = new User({
					createdAt,
					accountId: newAccount._id,
					username: input.accountOwnerName,
					email: input.accountOwnerEmail,
					role: UserRoles.AccountAdmin,
					password: password,
					passwordConfirm: passwordConfirm,
				})

				await accountAdmin.save({ session })

				const result = await createSendToken(accountAdmin)

				token = result.token
				user = result.user
				cookieOptions = result.cookieOptions
				account = newAccount
			})

			return { token, cookieOptions, user, account }
		} finally {
			session.endSession()
		}
	}

	public async getAccountById(id: Types.ObjectId): Promise<IAccount> {
		return await Account.findById(id).where({
			active: { $ne: false },
		})
	}

	public async updateMyAccount(accountId: Types.ObjectId, params: any): Promise<IAccount> {
		const filteredParams = setAllowedFields(
			params,
			'accountName',
			'accountOwnerName',
			'accountOwnerEmail',
			'contactName',
			'contactNumber',
			'contactEmail',
		)
		return await Account.findByIdAndUpdate(accountId, filteredParams, {
			new: true,
			runValidators: true,
		}).where({ active: { $ne: false } })
	}

	public async deleteMyAccount(accountId: Types.ObjectId): Promise<IAccount> {
		const session = await this.mongoose.startSession()
		let account: IAccount

		try {
			await session.withTransaction(async () => {
				await User.updateMany({ accountId, active: { $ne: false } }, { active: false }, { session })

				account = await Account.findByIdAndUpdate(accountId, { active: false }, { session })
			})

			return account
		} finally {
			session.endSession()
		}
	}

	public async createUserForMyAccount(userData: Partial<IUser>) {
		return await User.create(userData)
	}

	public async getUsersForMyAccount(accountId: Types.ObjectId): Promise<Array<IUser>> {
		return await User.find({ accountId })
	}

	public async getUserById(accountId: Types.ObjectId, userId: string): Promise<IUser> {
		return await User.findOne({ accountId, _id: userId })
	}

	public async softDeleteUser(accountId: Types.ObjectId, userId: string): Promise<IUser> {
		const user = await User.findByIdAndUpdate(userId, { active: false }).where({ accountId })
		return user
	}
}
