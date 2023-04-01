import express, { Router } from 'express'
import { Services } from '../services'
import { protect } from 'middleware/protect'
import { restrictTo } from 'middleware/restrictTo'
import { UserRoles } from '../common'

export default function (db: Services) {
	const { getAllAccounts, getAccountById, softDeleteAccount, restoreAccount, updateAccount, getUsersForAccount } = db.controllers.admin

	const router: Router = express.Router()

	router.use(protect, restrictTo(UserRoles.SystemAdmin))

	router.route('/accounts').get(getAllAccounts)

	router.route('/accounts/:accountId').get(getAccountById).delete(softDeleteAccount).patch(updateAccount)

	router.route('/accounts/restore/:accountId').patch(restoreAccount)

	router.get('/accounts/:accountId/users', getUsersForAccount)

	return router
}
