const mongoose = require('mongoose')
const validator = require('validator')
const bycrypt = require('bcrypt')
const crypto = require('crypto')

const userSchema = mongoose.Schema({
   createdAt: {
      type: Date,
      validate: [validator.isDate, 'The created at date is not valid'],
   },
   account: {
      type: mongoose.Schema.ObjectId,
      ref: 'Account',
   },
   username: {
      type: String,
      required: [true, 'Please provide a username'],
   },
   email: {
      type: String,
      required: [true, 'You must provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
   },
   photo: String,
   role: {
      type: String,
      enum: ['user', 'manager', 'admin', 'accountAdmin'],
      default: 'user',
   },
   password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
   },
   passwordConfirm: {
      type: String,
      required: [true, 'Please confirm you password'],
      validate: {
         // This only works on CREATE and SAVE!!!
         validator: function (el) {
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

userSchema.pre('save', function (next) {
   if (this.createdAt) {
      // todo: remove this.createdAt for production
      this.createdAt = new Date(this.createdAt)
   } else {
      this.createdAt = new Date()
   }
   next()
})

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next()

   this.password = await bycrypt.hash(this.password, 12)

   this.passwordConfirm = undefined
   next()
})

userSchema.pre('save', function (next) {
   if (!this.isModified('password') || this.isNew) return next()

   this.passwordChangedAt = Date.now() - 1000

   next()
})

userSchema.pre(/^find/, function (next) {
   this.find({ active: { $ne: false } })
   next()
})

userSchema.methods.correctPassword = async function (candidatePassword, hashedPassword) {
   return await bycrypt.compare(candidatePassword, hashedPassword)
}

userSchema.methods.changedPasswordAfterTokenIssued = function (JWTTimeStamp) {
   if (this.passwordChangedAt) {
      const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10) // convert to milliseconds
      return JWTTimeStamp < changedTimeStamp
   }

   return false
}

userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex')
   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000
   return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
