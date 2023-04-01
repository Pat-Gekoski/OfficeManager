import mongoose, { Schema } from 'mongoose'
import validator from 'validator'

import { IAccount } from '@common'

const accountSchema = new Schema<IAccount>({
	createdAt: {
		type: Date,
		required: [true, 'An account must have a date created at'],
		validate: [validator.isDate, 'The created at date is not valid'],
	},
	expires: {
		type: Date,
		// required: [true, 'An account must have an expiration date'],
		validate: [validator.isDate, 'The expiration date is not valid'],
	},
	accountName: {
		type: String,
		maxlength: 30,
		required: [true, 'An account must have a name'],
		unique: true,
		trim: true,
	},
	// account owner's name
	accountOwnerName: {
		type: String,
		required: [true, 'An account must have an owner'],
		trim: true,
	},
	accountOwnerEmail: {
		type: String,
		required: [true, 'An account must have an account owner email'],
		validate: [validator.isEmail]
	},
	contactName: {
		type: String
	},
	contactNumber: {
		type: String,
		length: 10,
	},
	contactEmail: {
		type: String,
		validate: [validator.isEmail]
	},
	active: {
		type: Boolean,
		default: true,
		select: false,
	},
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

accountSchema.pre(/^find/, function (next) {
	this.select('-__v')
	next()
})

export default mongoose.model<IAccount>('Account', accountSchema)
