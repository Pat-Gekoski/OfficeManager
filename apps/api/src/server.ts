import { config } from '../config'
import { Services } from './services/services'
import accountsRouter from './routes/accountRoutes'
import usersRouter from './routes/userRoutes'
import adminRouter from './routes/adminRoutes'
import ErrorController from 'controllers/error.controller'
import AppError from 'utils/appError'

process.on('uncaughtException', async (err) => {
	console.error(err)
	console.info('Closing database connections.')
	await db.close()
	console.info('Database connections closed.')
	process.exit(1)
})

import app from './app'

const db = new Services()
const errorController = new ErrorController()

const server = app.listen(config.port, async () => {
	await db.createDatabaseConnection()
	await db.initializeDependencies()
	await db.resolveServices()
	await db.resolveControllers()
	// load routes
	app.use('/api/v1/admin', adminRouter(db))
	app.use('/api/v1/accounts', accountsRouter(db))
	app.use('/api/v1/users', usersRouter(db))
	app.all('*', (req, _, next) => {
		next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
	})
	app.use(errorController.globalErrorHandler)
	console.info(`App running on port ${config.port}`)
})

process.on('unhandledRejection', async (err) => {
	console.error(err)
	console.info('Closing database connections.')
	await db.close()
	console.info('Database connections closed.')
	server.close()
	process.exit(1)
})

process.on('SIGINT', async function () {
	console.info('Closing database connections.')
	await db.close()
	console.info('Database connections closed.')
	process.exit(0)
})

process.on('SIGTERM', async function () {
	console.info('Closing database connections.')
	await db.close()
	console.info('Database connections closed.')
	process.exit(0)
})
