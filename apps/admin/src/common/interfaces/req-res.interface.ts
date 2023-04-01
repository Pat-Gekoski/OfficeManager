import { Request } from 'express'
import { IUser } from './user.interface'

export interface AppRequest extends Request {
	user?: IUser
}
