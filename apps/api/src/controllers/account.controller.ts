import { Response, Request, NextFunction } from 'express'
import AppError from '../utils/appError'
import { catchAsync } from '../utils/catchAsync'
import { AppRequest, ResponseStatus } from '@common'
import AccountService from '../services/account/account.service'

export default class AccountController {
	constructor(private readonly accountService: AccountService) {}

	public signUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const { token, cookieOptions, user, account } = await this.accountService.signUp(
			{
				accountName: req.body.accountName,
				accountOwnerName: req.body.accountOwnerName,
				accountOwnerEmail: req.body?.accountOwnerEmail,
				contactName: req.body?.contactName,
				contactNumber: req.body.contactNumber,
				contactEmail: req.body.contactEmail,
			},
			req.body.password,
			req.body.passwordConfirm,
		)

		res.cookie('jwt', token, cookieOptions)

		res.status(201).json({
			status: ResponseStatus.SUCCESS,
			token,
			data: {
				user,
				account,
			},
		})
	})

	public getMyAccount = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		const account = await this.accountService.getAccountById(req.user.accountId)

		if (!account) {
			return next(new AppError('There is no account associated with this user', 404))
		}

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			data: {
				account,
			},
		})
	})

	public updateMyAccount = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		const account = await this.accountService.updateMyAccount(req.user.accountId, req.body)

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

	public deleteMyAccount = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		const account = this.accountService.deleteMyAccount(req.user.accountId)

		if (!account) {
			return next(new AppError('No account found with that ID', 404))
		}

		// todo: log the user out

		res.status(204).json({
			status: ResponseStatus.SUCCESS,
			data: null,
		})
	})

	public createUserForMyAccount = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		const user = await this.accountService.createUserForMyAccount({
			accountId: req.user.accountId,
			username: req.body.username,
			email: req.body.email,
			role: req.body.role,
			password: req.body.password,
			passwordConfirm: req.body.passwordConfirm,
		})

		res.status(201).json({
			status: ResponseStatus.SUCCESS,
			data: {
				user,
			},
		})
	})

	public getUsersForMyAccount = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		const users = await this.accountService.getUsersForMyAccount(req.user.accountId)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			data: {
				results: users.length,
				users,
			},
		})
	})

	public getUser = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		const user = await this.accountService.getUserById(req.user.accountId, req.params.userId)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			data: {
				user,
			},
		})
	})

	public softDeleteUser = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		const user = await this.accountService.softDeleteUser(req.user.accountId, req.params.userId)
		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			data: {
				user,
			},
		})
	})
}
