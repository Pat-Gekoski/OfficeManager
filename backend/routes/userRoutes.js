const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
router.patch('/updateMyPassword', authController.protect, authController.updatePassword)

router.patch('/updateMe', authController.protect, userController.updateMe)
router.delete('/deleteMe', authController.protect, userController.deleteMe)

// todo: restrict to account
router
   .route('/')
   .get(
      authController.protect,
      authController.restrictTo('systemAdmin', 'accountAdmin', 'admin'),
      userController.getAllUsers
   )

// todo: restrict to account
router
   .route('/:id')
   .get(
		authController.protect, 
		authController.restrictTo('systemAdmin', 'accountAdmin', 'admin'), 
		userController.getUser
	)
   .post(
      authController.protect,
      authController.restrictTo('systemAdmin', 'accountAdmin', 'admin'),
      userController.createUser
   )

module.exports = router
