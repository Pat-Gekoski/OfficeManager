import { ResponseStatus } from '@common'
import { Request, Response, NextFunction } from 'express'
import { config } from '../../config'
import AppError from '../utils/appError'

export default class ErrorController {
	constructor() {}

	static globalErrorHandler(globalErrorHandler: any) {
		throw new Error('Method not implemented.')
	}

	private handleCastErrorDB = (err: any) => {
		const message = `Invalid ${err.path}: ${err.value}.`
		return new AppError(message, 400)
	}

	private handleValidationErrorDB = (err: any) => {
		const errors = Object.values(err.errors).map((el: any) => el.message)

		const message = `Invalid input data. ${errors.join('. ')}`
		return new AppError(message, 400)
	}

	private handleDuplicateFieldsDB = (err: any) => {
		const [key, value] = Object.entries(err.keyValue)[0]
		const message = `Duplicate field value for ${key}: ${value}. Please use another value!`
		return new AppError(message, 400)
	}

	private handleJWTError = () => new AppError('Invalid token. Please log in again', 401)

	private handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again', 401)

	private sendErrorDev = (err: any, res: Response) => {
		res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		})
	}

	private sendErrorProd = (err: any, res: Response) => {
		if (err.isOperational) {
			// send error message to the client
			res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			})
		} else {
			// send generic error
			res.status(500).json({
				status: ResponseStatus.ERROR,
				message: 'Something went wrong!',
			})
		}
	}

	// Express knows this is error handling middleware because it accepts 4 parameters, the first bing the error.
	public globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
		err.statusCode = err.statusCode || 500
		err.status = err.status || ResponseStatus.ERROR

		if (config.environment === 'development') {
			this.sendErrorDev(err, res)
		} else if (config.environment === 'production') {
			let error: AppError = err

			if (err.name === 'CastError') error = this.handleCastErrorDB(err)
			if (err.name === 'ValidationError') error = this.handleValidationErrorDB(err)
			if (err.code === 11000) error = this.handleDuplicateFieldsDB(err)
			if (err.name === 'JsonWebTokenError') error = this.handleJWTError()
			if (err.name === 'TokenExpiredError') error = this.handleJWTExpiredError()

			this.sendErrorProd(error, res)
		}
	}
}
