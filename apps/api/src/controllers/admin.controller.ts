import { Request, Response, NextFunction } from 'express'
import { catchAsync } from '../utils/catchAsync'
import { setAllowedFields } from '../utils/allowedFields'
import { ResponseStatus } from '../common'
import AppError from '../utils/appError'
import SystemAdminService from '../services/system-admin/system-admin.service'

export default class AdminController {
	constructor(private systemAdminService: SystemAdminService) {}

	public getAllAccounts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const accounts = await this.systemAdminService.getAllAccounts(req.query)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			results: accounts.length,
			data: {
				accounts,
			},
		})
	})

	public getAccountById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const account = await this.systemAdminService.getAccountById(req.params.accountId)

		if (!account) {
			return next(new AppError('No account found with that ID', 404))
		}

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			data: {
				account,
			},
		})
	})

	public updateAccount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		if (req.body.password || req.body.passwordConfirm) {
			return next(new AppError('This route is not for password updates.', 400))
		}

		const filteredBody = setAllowedFields(
			req.body,
			'accountName',
			'accountOwnerName',
			'accountOwnerEmail',
			'contactNumber',
			'contactEmail',
			'expires',
		)

		const account = await this.systemAdminService.updateAccount(req.params.accountId, filteredBody)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			data: {
				account,
			},
		})
	})

	public softDeleteAccount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const account = this.systemAdminService.softDeleteAccount(req.params.id)

		if (!account) {
			return next(new AppError('No account found with that ID', 404))
		}

		res.status(204).json({
			status: ResponseStatus.SUCCESS,
			data: null,
		})
	})

	public restoreAccount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const account = await this.systemAdminService.restoreAccount(req.params.accountId)

		if (!account) {
			return next(new AppError('There is no account with that ID', 404))
		}

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			data: {
				account,
			},
		})
	})

	public getUsersForAccount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const users = await this.systemAdminService.getUsersForAccount(req.query, req.params.accountId)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			results: users.length,
			data: {
				users,
			},
		})
	})
}
