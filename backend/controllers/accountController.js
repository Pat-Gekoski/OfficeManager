const Account = require('../models/accountModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const allowedFields = require('../utils/allowedFields')

exports.getAccount = catchAsync(async (req, res, next) => {
   const account = await Account.findById(req.user.account).where({ active: { $ne: false } })

   if (!account) {
      return next(new AppError('There is no account associated with this user', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         account,
      },
   })
})

exports.updateAccount = catchAsync(async (req, res, next) => {
   const filteredBody = allowedFields(req.body, 'accountOwner', 'contactNumber')
   const account = await Account.findByIdAndUpdate(req.user.account, filteredBody, {
      new: true,
      runValidators: true,
   }).where({ active: { $ne: false } })

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
   const account = await Account.findByIdAndUpdate(req.user.account, { active: false }).where({
      active: { $ne: false },
   })

   if (!account) {
      return next(new AppError('No account found with that ID', 404))
   }

   res.status(204).json({
      status: 'success',
      data: null,
   })
})
