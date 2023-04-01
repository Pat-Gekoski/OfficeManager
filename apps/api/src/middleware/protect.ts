import AppError from 'utils/appError'
import { config } from '../../config'
import jwt from 'jsonwebtoken'
import User from 'models/userModel'

export async function protect(req, res, next) {
	try {
		let token: string
	
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1]
		} else if (req.cookies.jwt) {
			token = req.cookies.jwt
		}
	
		if (!token) {
			return next(new AppError('You are not logged in. Log in to gain access.', 401))
		}
	
		const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload
		// check if the user still exits
		const currentUser = await User.findById(decoded.id)
	
		if (!currentUser) {
			return next(new AppError('The user beloning to this token no longer exists.', 401))
		}
	
		if (currentUser.changedPasswordAfterTokenIssued(decoded.iat)) {
			return next(new AppError('User recently changed password. Please login again.', 401))
		}
	
		req.user = currentUser
	
		next()
	} catch (err) {
		return next(new AppError('Invalid token', 401))
	}
}
