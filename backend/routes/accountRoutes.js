const accountController = require('../controllers/accountController')
const authController = require('../controllers/authController')
const express = require('express')

const router = express.Router()

router.post('/signUp', authController.signUp)

router
   .route('/')
   .get(
      authController.protect,
      authController.restrictTo('systemAdmin'),
      accountController.getAllAccounts
   )

router
   .route('/:id')
   .get(
      authController.protect,
      authController.restrictTo('systemAdmin, accountAdmin'),
      accountController.getAccount
   ) // todo: restrict to specific admin or systemAdmin
	
   .patch(
      authController.protect,
      authController.restrictTo('systemAdmin, accountAdmin'),
      accountController.updateAccount
   ) // todo: restrict to specific admin or systemAdmin
   .delete(
      authController.protect,
      authController.restrictTo('systemAdmin, accountAdmin'),
      accountController.deleteAccount
   ) // todo: restrict to specific admin or systemAdmin

module.exports = router
