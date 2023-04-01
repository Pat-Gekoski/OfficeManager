import express, { Router } from 'express'
import { Services } from '../services'
import { UserRoles } from '../common'
import { protect } from 'middleware/protect'
import { restrictTo } from 'middleware/restrictTo'

export default function (db: Services) {
	const router: Router = express.Router()

	const { login, forgotPassword, resetPassword } = db.controllers.auth
	const { updateMyPassword, updateMe, deleteMe } = db.controllers.user

	router.post('/login', login)
	router.post('/forgotPassword', forgotPassword)
	router.patch('/resetPassword/:token', resetPassword)

	router.patch('/updateMyPassword', protect, updateMyPassword)
	router.patch('/updateMe', protect, updateMe)
	router.delete('/deleteMe', protect, restrictTo(UserRoles.Admin, UserRoles.Manager, UserRoles.User), deleteMe)

	return router
}
