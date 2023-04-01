import { UserRoles } from '../enums'
import { Document, Types } from 'mongoose'

export interface IUser extends Document {
	_id: Types.ObjectId
	active: boolean
	createdAt: Date
	accountId: Types.ObjectId
	username: string
	email: string
	role: 'user' | 'manager' | 'admin' | 'accountAdmin' | 'systemAdmin'
	password: string
	passwordConfirm: string | undefined
	updatedAt?: Date
	photo?: string
	passwordChangedAt?: Date
	passwordResetToken?: string
	passwordResetExpires?: Date
	createPasswordResetToken: () => string
	correctPassword: (candidatePassord: string, hashedPassword: string) => boolean
	changedPasswordAfterTokenIssued: (JWTTimeStamp: number) => boolean
}

export interface IUserMethods {
	correctPassword(password: string, hashedPassword: string): Promise<boolean>
	changedPasswordAfterTokenIssued(JWTTimeStamp: number): boolean
	createPasswordResetToken(): string
}

export interface ICreateUserInput {
	createdAt: Date
	accountId: Types.ObjectId
	username: string
	email: string
	role: UserRoles
	password: string
	passwordConfirm: string
}
