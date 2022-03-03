const mongoose = require('mongoose')
const validator = require('validator')

const accountSchema = new mongoose.Schema({
   createdAt: {
      type: Date,
      required: [true, 'An account must have a date created at'],
      validate: [validator.isDate, 'The created at date is not valid'],
   },
   expires: {
      type: Date,
      validate: [validator.isDate, 'The expiration date is not valid'],
   },
   name: {
      type: String,
      maxlength: 30,
      required: [true, 'An account must have a name'],
      unique: true,
      trim: true,
   },
   // owner's name
   accountOwner: {
      type: String,
      required: [true, 'An account must have an owner'],
      trim: true,
   },
   contactNumber: {
      type: String,
      required: [true, 'An account must have a contact number'],
		length: 10
   },
	active: {
		type: Boolean,
		default: true,
		select: false
	}
})

accountSchema.pre('save', function (next) {
   this.createdAt = new Date(this.createdAt)
   next()
})

accountSchema.pre('save', function (next) {
   let exp = new Date(this.createdAt)
   exp.setFullYear(exp.getFullYear() + 1)
   this.expires = exp
   next()
})

accountSchema.pre(/^find/, function(next) {
	this.select('-__v')
	next()
})

const Account = mongoose.model('Account', accountSchema)

module.exports = Account
