const accountController = require('../controllers/accountController')
const authController = require('../controllers/authController')
const express = require('express')

const router = express.Router()

router.post('/signUp', authController.signUp)

router
   .route('/')
   .get(
      authController.protect,
      authController.restrictTo('accountAdmin'),
      accountController.getAccount
   )
	.patch(
      authController.protect,
      authController.restrictTo('accountAdmin'),
      accountController.updateAccount
   )
   .delete(
      authController.protect,
      authController.restrictTo('accountAdmin'),
      accountController.deleteAccount
   ) 

module.exports = router
