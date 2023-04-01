export interface IAppError {
	statusCode: number
	status: 'fail' | 'error'
	isOperational: boolean
}
