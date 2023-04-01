import { Response, NextFunction } from 'express'
import AppError from '../utils/appError'
import { catchAsync } from '../utils/catchAsync'
import { AppRequest, ResponseStatus } from '../common'
import UserService from '../services/user/user.service'

export default class UserController {
	constructor(private readonly userService: UserService) {}

	public updateMyPassword = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		const { token, cookieOptions, user } = await this.userService.updateMyPassword(
			req.user?.id,
			req.body.currentPassword,
			req.body.password,
			req.body.passwordConfirm,
		)

		res.cookie('jwt', token, cookieOptions)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			token,
			user,
		})
	})

	public updateMe = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		if (req.body.password || req.body.passwordConfirm) {
			return next(new AppError('This route is not for password updates.', 400))
		}

		const user = await this.userService.updateMe(req.user.id, req.body)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			data: {
				user,
			},
		})
	})

	public deleteMe = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		await this.userService.deleteMe(req.user.id)

		res.status(204).json({
			status: ResponseStatus.SUCCESS,
			data: null,
		})
	})
}
