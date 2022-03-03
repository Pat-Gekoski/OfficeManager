const Account = require('../models/accountModel')
const AppError = require('../utils/appError')
const ApiFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const allowedFields = require('../utils/allowedFields')

exports.getAllAccounts = catchAsync(async (req, res, next) => {
   const features = new ApiFeatures(Account.find().select('+active'), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

   const accounts = await features.query

   res.status(200).json({
      requestTime: req.requestTime,
      status: 'success',
      results: accounts.length,
      data: {
         accounts,
      },
   })
})

exports.getAccount = catchAsync(async (req, res, next) => {
   const account = await Account.findById(req.params.id)

   if (!account) {
      return next(new AppError('No account found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         account,
      },
   })
})

exports.updateAccount = catchAsync(async (req, res, next) => {
   if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for password updates.', 400))
   }

   const filteredBody = allowedFields(req.body, 'name', 'accountOwner', 'contactNumber', 'expires')

   const account = await Account.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
   })

   res.status(200).json({
      status: 'success',
      data: {
         account,
      },
   })
})

exports.deleteAccount = catchAsync(async (req, res, next) => {
   const account = await Account.findByIdAndUpdate(req.params.id, { active: false }, { new: true })

   if (!account) {
      return next(new AppError('No account found with that ID', 404))
   }

   res.status(204).json({
      status: 'success',
      data: null,
   })
})

exports.restoreAccount = catchAsync(async (req, res, next) => {
   const account = await Account.findByIdAndUpdate(
      req.params.id,
      { active: true },
      { new: true }
   ).select('+active')

   if (!account) {
      return next(new AppError('There is no account with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         account,
      },
   })
})
