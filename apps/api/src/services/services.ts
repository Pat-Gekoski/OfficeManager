import { config } from '../../config'
import { AwilixContainer, Lifetime, InjectionMode } from 'awilix'
import * as awilix from 'awilix'
import * as fg from 'fast-glob'
import mongoose, { Mongoose } from 'mongoose'
import AppError from 'utils/appError'

export class Services {
	public mongoose: Mongoose
	public container: AwilixContainer
	public services: { [key: string]: any } = {}
	public serviceTypes: Array<string> = []
	public controllers: Record<string, any> = {}
	public controllerTypes: Array<string> = []

	constructor() {
		this.serviceTypes = fg.sync(['!**/dist', '**/*.service.(ts|js)'])
		this.controllerTypes = fg.sync(['!**/dist', '**/*.controller.(ts|js)'])
		if (!this.serviceTypes || !this.serviceTypes.length) {
			throw new AppError('Could not find any services to load', 400)
		}
		if (!this.controllerTypes || !this.controllerTypes.length) {
			throw new AppError('Could not find any controllers to load', 400)
		}
	}

	public async createDatabaseConnection() {
		console.info('Creating DB connection...')
		if (!config.db.connectionString) {
			throw new AppError(`No mongoose connection string was found`, 400)
		}
		const DB = config.db.connectionString.replace('<PASSWORD>', config.db.password)
		mongoose.set('strictQuery', true)
		this.mongoose = await mongoose.connect(DB, {
			minPoolSize: 5,
			maxPoolSize: 30,
			connectTimeoutMS: 30000,
			keepAlive: true,
		})
		console.info('DB connection successfull!')
	}

	public async initializeDependencies() {
		console.info('Initializing dependencies...')
		this.container = awilix.createContainer({
			injectionMode: InjectionMode.CLASSIC,
		})
		this.container.register({
			mongoose: awilix.asValue(this.mongoose),
		})
		this.container.register({ placeholder: awilix.asValue(true) })
		this.container.loadModules(['./src/**/*.service.+(ts|js)', './src/**/*.controller.+(ts|js)'], {
			formatName: 'camelCase',
			resolverOptions: {
				lifetime: Lifetime.SINGLETON,
				register: awilix.asClass,
			},
		})
		console.info('Dependencies initialized!')
	}

	public async resolveServices(): Promise<any> {
		console.info('Resolving services...')
		for (const serviceLocation of this.serviceTypes) {
			try {
				const service = (await import(serviceLocation.replace(/^src\/services\//, './'))).default
				const serviceName = service.name.toLowerCase().replace(/service$/, '')
				this.services[serviceName] = this.container.resolve(service.name.charAt(0).toLowerCase() + service.name.slice(1))
			} catch (err) {
				console.error(`Could not resolve service at ${serviceLocation}`, err)
			}
		}
		console.info('Services resolved.')
	}

	public async resolveControllers(): Promise<any> {
		console.info('Resolving controllers...')
		for (const controllerLocation of this.controllerTypes) {
			try {
				const controller = (await import(controllerLocation.replace(/^src\/controllers\//, '../controllers/'))).default
				const controllerName = controller.name.toLowerCase().replace(/controller$/, '')
				this.controllers[controllerName] = this.container.resolve(
					controller.name.charAt(0).toLowerCase() + controller.name.slice(1),
				)
			} catch (err) {
				console.error(`Could not resolve controller at ${controllerLocation}`, err)
			}
		}
		console.info('Controllers resolved!')
	}

	public async close(): Promise<void> {
		if (this.mongoose) {
			await Promise.all(mongoose.connections.map((conn) => (conn.readyState === 1 ? conn.close() : Promise.resolve())))
		}
	}
}
