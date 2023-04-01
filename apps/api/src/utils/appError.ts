import { ResponseStatus } from '@common'

class AppError extends Error {
	public statusCode: number
	public status: 'fail' | 'error'
	public isOperational: boolean

	constructor(message: string, statusCode: number) {
		super(message)

		this.statusCode = statusCode
		this.status = `${statusCode}`.startsWith('4') ? ResponseStatus.FAIL : ResponseStatus.ERROR
		this.isOperational = true

		Error.captureStackTrace(this, this.constructor)
	}
}

export default AppError
