const User = require('../models/userModel')
const AppError = require('../utils/appError')
const ApiFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const allowedFields = require('../utils/allowedFields')


exports.getAllUsers = catchAsync(async (req, res, next) => {
   const features = new ApiFeatures(User.find(), req.query).filter().sort().limitFields().paginate()

   const users = await features.query.select('-__v')

   res.status(200).json({
      requestTime: req.requestTime,
      status: 'success',
      results: users.length,
      data: {
         users,
      },
   })
})

exports.getUser = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.params.id)

   if (!user) {
      return next(new AppError('No user found for that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         user,
      },
   })
})

exports.createUser = catchAsync(async (req, res, next) => {
   const newUser = await User.create({
      account: req.params.id,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
   })

   res.status(201).json({
      status: 'success',
      data: {
         user: newUser,
      },
   })
})

// for user's to update their own info
exports.updateMe = catchAsync(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm){
		return next(new AppError('This route is not for password updates.', 400))
	}

	const filteredBody = allowedFields(req.body, 'username', 'email', 'photo')
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true
	})

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser
		}
	})
})

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, {active: false})

	res.status(204).json({
		status: 'success',
		data: null
	})
})

// for admins
exports.updateUser = catchAsync(async (req, res, next) => {
   // todo: this.....
   res.status(500).json({
      message: "haven't implemented this route yet",
   })
})
