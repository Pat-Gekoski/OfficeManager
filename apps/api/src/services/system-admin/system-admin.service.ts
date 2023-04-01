import ApiFeatures from 'utils/apiFeatures'
import Account from 'models/accountModel'
import User from 'models/userModel'
import { BaseService } from '../base-service'
import { IAccount, IUser } from '../../common'

export default class SystemAdminService extends BaseService {
	constructor() {
		super()
	}

	public async getAllAccounts(query: any): Promise<Array<IAccount>> {
		const features = new ApiFeatures(Account.find().select('+active'), query).filter().sort().limitFields().paginate()
		return await features.query
	}

	public async getAccountById(accountId: string): Promise<IAccount> {
		return await Account.findById(accountId)
	}

	public async softDeleteAccount(accountId: string): Promise<IAccount> {
		return await Account.findByIdAndUpdate(accountId, { active: false }, { new: true })
	}

	public async updateAccount(accountId: string, params: any): Promise<IAccount> {
		return await Account.findByIdAndUpdate(accountId, params, {
			new: true,
			runValidators: true,
		})
	}

	public async restoreAccount(accountId: string): Promise<IAccount> {
		return await Account.findByIdAndUpdate(accountId, { active: true }, { new: true }).select('+active')
	}

	public async getUsersForAccount(query: any, accountId: string): Promise<Array<IUser>> {
		const features = new ApiFeatures(User.find().select('+active'), query).filter().sort().limitFields().paginate()
		return await features.query.where({ accountId: accountId })
	}
}
