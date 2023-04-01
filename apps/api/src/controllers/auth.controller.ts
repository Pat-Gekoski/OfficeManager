import { Response, Request, NextFunction } from 'express'
import User from '../models/userModel'
import AppError from '../utils/appError'
import { catchAsync } from '../utils/catchAsync'
import { AppRequest, ResponseStatus } from '../common'
import AuthService from '../services/auth/auth.service'

export default class AuthController {
	constructor(private readonly authService: AuthService) {}

	public login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body

		if (!email || !password) {
			return next(new AppError(`You must provided an email and password`, 400))
		}

		const { token, cookieOptions, user } = await this.authService.login(email, password)

		res.cookie('jwt', token, cookieOptions)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			token,
			data: {
				user,
			},
		})
	})

	public forgotPassword = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
		const user = await User.findOne({ email: req.body.email })

		if (!user) {
			return next(new AppError('There is no user with that email address', 404))
		}

		await this.authService.sendPasswordResetEmail(user, req)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			message: 'Reset password email was sent successfully.',
		})
	})

	public resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const { token, cookieOptions } = await this.authService.resetPassword(req.params.token, req.body.password, req.body.passwordConfirm)

		res.cookie('jwt', token, cookieOptions)

		res.status(200).json({
			status: ResponseStatus.SUCCESS,
			token,
		})
	})
}
