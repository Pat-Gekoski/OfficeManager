import AppError from 'utils/appError'

export function restrictTo(...roles: string[]) {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new AppError('You do not have permission to perform this action', 403))
		}
		next()
	}
}
