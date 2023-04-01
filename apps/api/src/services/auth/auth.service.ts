import { BaseService } from '../base-service'
import { IUser } from '../../common'
import User from 'models/userModel'
import { createSendToken } from 'utils/token.utils'
import { CookieOptions, Request } from 'express'
import { config } from '../../../config'
import AppError from 'utils/appError'
import crypto from 'crypto'
import EmailService from '../email/email.service'

export default class AuthService extends BaseService {
	constructor(private readonly emailService: EmailService) {
		super()
	}

	public async login(email: string, password: string): Promise<{ token: string; cookieOptions: CookieOptions; user: IUser }> {
		const user = await User.findOne({ email }).select('+password')

		if (user) {
			const correctPassword = await user.correctPassword(password, user.password)
			if (correctPassword) {
				return await createSendToken(user)
			} else {
				throw new AppError('Incorrect email or password', 401)
			}
		}
	}

	public async sendPasswordResetEmail(user: IUser, req: Request): Promise<void> {
		const resetToken = user.createPasswordResetToken()
		await user.save({ validateBeforeSave: false })

		const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/${resetToken}`
		const message = `Forgot your password? Click the link link below to set a new password.\n
							     ${resetURL} \n If you did not send this request, simply ignore this email.`

		const emailData = {
			to: [{ email: user.email }],
			from: { email: config.sendGrid.sender.email, name: config.sendGrid.sender.emailName },
			subject: 'Your passowrd reset token (valid for 10 minutes)',
			text: message,
			html: `<p>Forgot your password? Click the link link below to set a new password.</p>
				    <p><a href="${resetURL}">Reset password</a></p>
					 <p>If the link doesn't work, copy this link and paste it in your browser: ${resetURL}</p>
				    <p>If you did not send this request, simply ignore this email.</p>
		 	      `,
		}
		try {
			await this.emailService.sendEmail(emailData)
		} catch (err) {
			user.passwordResetToken = undefined
			user.passwordResetExpires = undefined
			await user.save({ validateBeforeSave: false })
			throw new AppError('There was an error sending the password reset email. Please try again later.', 500)
		}
	}

	public async resetPassword(
		token: string,
		password: string,
		passwordConfirm: string,
	): Promise<{ token: string; cookieOptions: CookieOptions }> {
		const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() },
		})

		if (!user) {
			throw new AppError('Token is invalid or has expired', 401)
		}

		user.password = password
		user.passwordConfirm = passwordConfirm
		user.passwordResetToken = undefined
		user.passwordResetExpires = undefined
		await user.save()

		const { token: updatedToken, cookieOptions } = await createSendToken(user)

		return {
			token: updatedToken,
			cookieOptions,
		}
	}
}
