import express, { Router } from 'express'
import { UserRoles } from '../common'
import { Services } from '../services'
import { protect } from 'middleware/protect'
import { restrictTo } from 'middleware/restrictTo'

export default function (db: Services) {
	const { signUp } = db.controllers.account
	const { getMyAccount, updateMyAccount, deleteMyAccount, createUserForMyAccount, getUsersForMyAccount, getUser, softDeleteUser } =
		db.controllers.account

	const router: Router = express.Router()

	router.post('/signup', signUp)

	router.use(protect)

	router
		.route('/')
		.get(restrictTo(UserRoles.AccountAdmin), getMyAccount)
		.patch(restrictTo(UserRoles.AccountAdmin), updateMyAccount)
		.delete(restrictTo(UserRoles.AccountAdmin), deleteMyAccount)

	router
		.route('/user')
		.get(restrictTo(UserRoles.AccountAdmin, UserRoles.Admin, UserRoles.Manager), getUsersForMyAccount)
		.post(restrictTo(UserRoles.AccountAdmin, UserRoles.Admin, UserRoles.Manager), createUserForMyAccount)

	router.get('/user/:userId', getUser)
	router.patch('/user/soft-delete/:userId', softDeleteUser)

	return router
}
