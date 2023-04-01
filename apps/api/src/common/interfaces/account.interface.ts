import { Types } from 'mongoose'

export interface IAccount {
	_id: Types.ObjectId
	active: boolean
	createdAt: Date
	expires: Date
	accountName: string
	accountOwnerName: string
	accountOwnerEmail: string
	contactName?: string
	contactNumber?: string
	contactEmail?: string
}

export interface ICreateAccountInput {
	createdAt?: Date
	accountName: string
	accountOwnerName: string
	accountOwnerEmail: string
	contactName?: string
	contactNumber?: string
	contactEmail?: string
}
