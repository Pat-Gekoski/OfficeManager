import mongoose, { Schema, Model } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

import { IUser, IUserMethods, UserRoles } from '../common'

const roles: string[] = [UserRoles.SystemAdmin, UserRoles.AccountAdmin, UserRoles.Admin, UserRoles.Manager, UserRoles.User]

export type UserModel = Model<IUser, {}, IUserMethods>

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
	createdAt: {
		type: Date,
		validate: [validator.isDate, 'The created at date is not valid'],
	},
	updatedAt: {
		type: Date,
		validate: [validator.isDate, 'The updated at date is not valid'],
	},
	// todo: should this be an array so a user can be associated with multiple accounts?
	accountId: {
		type: Schema.Types.ObjectId,
		required: [
			function () {
				return this.role !== UserRoles.SystemAdmin
			},
			'A user must be associated with an account',
		],
		ref: 'Account',
	},
	username: {
		type: String,
		required: [true, 'You must provide a username'],
		trim: true,
		minlength: [2, 'A user name must contain at least 2 characters'],
	},
	email: {
		type: String,
		required: [true, 'You must provide an email'],
		unique: true,
		lowercase: true,
		trim: true,
		validate: [validator.isEmail, 'You must provide a valid email'],
	},
	photo: String,
	role: {
		type: String,
		enum: {
			values: roles,
			message: 'You must provide a valid user role. You provided ({VALUE})',
		},
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'You must provide a password'],
		minlength: [8, 'A passwowrd must contain at least 8 characters'],
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'You must confirm your password'],
		validate: {
			// This only works on CREATE and SAVE!!!
			validator(el) {
				// this only points to current doc on new document creation
				return el === this.password
			},
			message: 'Passwords are not the same!',
		},
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false,
	},
})

// TODO
// decide when to increment updated at

// pre-save hook only runs on create() and save() but not on createMany()
// pre-save hooks will not run during update operations either!
// this keyword will refer to the document
userSchema.pre('save', function (next) {
	if (this.createdAt) {
		this.createdAt = new Date(this.createdAt)
	} else {
		this.createdAt = new Date()
	}
	next()
})

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()

	this.password = await bcrypt.hash(this.password, 12)

	this.passwordConfirm = undefined
	next()
})

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next()

	this.passwordChangedAt = new Date(Date.now() - 1000)

	next()
})
// this keyword will refer to the current query and not the document
userSchema.pre(/^find/, function (next) {
	// todo: what if systemAdmin wants to see deleted users too?
	this.find({ active: { $ne: false } })
	next()
})

userSchema.pre(/^find/, function (next) {
	this.select('-__v')
	next()
})

userSchema.methods.correctPassword = async function (candidatePassword: string, hashedPassword: string) {
	return await bcrypt.compare(candidatePassword, hashedPassword)
}

userSchema.methods.changedPasswordAfterTokenIssued = function (JWTTimeStamp: number) {
	if (this.passwordChangedAt) {
		const changedTimeStamp = this.passwordChangedAt.getTime() / 1000
		return JWTTimeStamp < changedTimeStamp
	}
	return false
}

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex')
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
	return resetToken
}

export default mongoose.model<IUser, UserModel>('User', userSchema)
