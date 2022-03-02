const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const crypto = require('crypto')
const Account = require('../models/accountModel')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const sendEmail = require('../utils/email')

const signToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
   })
}

const createSendToken = async (user, statusCode, res, account) => {
   const token = signToken(user._id)

   const cookieOptions = {
      expires: new Date(Date.now() * 24 * 60 * 60 * 1000),
      httpOnly: true,
   }
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

   res.cookie('jwt', token, cookieOptions)

   user.password = undefined

   res.status(statusCode).json({
      status: 'success',
      token,
      data: {
         user,
         account,
      },
   })
}

exports.signUp = catchAsync(async (req, res, next) => {
   // the date the account and account admin where created
   const createdAt = req.body.createdAt ? new Date(req.body.createdAt) : new Date()

   const account = await Account.create({
      createdAt,
      name: req.body.name,
      accountOwner: req.body.accountOwner,
      contactNumber: req.body.contactNumber,
   })

   // todo: maybe add try/catch incase validation fails here, then remove the account
   const accountAdmin = await User.create({
      createdAt,
      account: account._id,
      username: req.body.accountOwner,
      email: req.body.email,
      role: 'accountAdmin',
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
   })

   createSendToken(accountAdmin, 201, res, account)
})

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body

   if (!email || !password) {
      return next(new AppError(`You must provided an email and password`, 400))
   }

   const user = await User.findOne({ email }).select('+password')

   if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401))
   }

   createSendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
   let token
   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
   } else if (req.cookies.jwt){
		token = req.cookies.jwt
	}

   if (!token) {
      return next(new AppError('You are not logged in. Log in to gain access.', 401))
   }
   // verify the token
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
   // check if the user still exits
   const currentUser = await User.findById(decoded.id)

   if (!currentUser) {
      return next(new AppError('The user beloning to this token no longer exists.', 401))
   }
   // iat == the timestamp JWT was issued at
   if (currentUser.changedPasswordAfterTokenIssued(decoded.iat)) {
      return next(new AppError('User recently changed password. Please login again.', 401))
   }
   // set user on request...they have been validated
   req.user = currentUser

   next()
})

exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return next(new AppError('You do not have permission to perform this action', 403))
      }
      next()
   }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
   const user = await User.findOne({ email: req.body.email })
   if (!user) {
      return next(new AppError('There is no user with that email address', 404))
   }

   const resetToken = user.createPasswordResetToken()
   await user.save({ validateBeforeSave: false })

   const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/${resetToken}`
   const message = `Forgot your password? Click the link link below to set a new password.\n
	${resetURL} \n 
	If you did not send this request, simply ignore this email.
	`

   try {
      await sendEmail({
         email: user.email,
         subject: `Your password rest token (valid for 10 minutes)`,
         message,
      })

      res.status(200).json({
         status: 'success',
         message: 'password reset email sent',
      })
   } catch (err) {
      console.log('ERR: ', err)
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false })

      return next(
         new AppError('There was an error sending the email. Please try again later.', 500)
      )
   }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
   const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
   // there is a user and the token hasn't expired
   const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
   })

   if (!user) {
      return next(new AppError('Token is invalid or has expired'))
   }

   user.password = req.body.password
   user.passwordConfirm = req.body.passwordConfirm
   user.passwordResetToken = undefined
   user.passwordResetExpires = undefined
   await user.save()

   createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.user.id).select('+password')

   const passwordMatch = await user.correctPassword(req.body.currentPassword, user.password)
   if (!passwordMatch) {
      return next(new AppError('Your current password is wrong', 401))
   }

   user.password = req.body.password
   user.passwordConfirm = req.body.passwordConfirm
   await user.save()

   createSendToken(user, 200, res)
})
