const Account = require('../models/accountModel')
const AppError = require('../utils/appError')
const ApiFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')

// restricted to systemAdmin
exports.getAllAccounts = catchAsync(async (req, res, next) => {
   const features = new ApiFeatures(Account.find(), req.query)
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
   const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   })

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

exports.deleteAccount = catchAsync(async (req, res, next) => {
   const account = await Account.findByIdAndDelete(req.params.id)

   if (!account) {
      return next(new AppError('No account found with that ID', 404))
   }

   res.status(204).json({
      status: 'success',
      data: null,
   })
})
