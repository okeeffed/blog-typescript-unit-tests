// src/dev-server.ts
import { createApp } from './index'
import { serve } from '@hono/node-server'
import { setupMockServer } from './mocks/server'
import { startTestContainers } from './utils/test-container'

async function startDevServer() {
	console.log('🚀 Starting development server with mocks...')

	// 1. Start test containers (Postgres and Valkey)
	try {
		console.log('📦 Starting test containers...')
		const containerInfo = await startTestContainers()

		// Set environment variables from container info
		process.env.DATABASE_URL = containerInfo.postgresConnectionString
		process.env.VALKEY_URL = containerInfo.valkeyConnectionString

		console.log('✅ Test containers started successfully')
		console.log(`📊 Postgres available at: ${containerInfo.postgresConnectionString}`)
		console.log(`🗄️ Valkey available at: ${containerInfo.valkeyConnectionString}`)
	} catch (error) {
		console.error('❌ Failed to start test containers:', error)
		process.exit(1)
	}

	// 2. Initialize MSW for API mocking
	const { startMocking, stopMocking } = setupMockServer()
	await startMocking()
	console.log('🔄 API mocks initialized')


	// Import your routes and middleware here
	// e.g., app.route('/', yourRoutes)
	const app = createApp()


	// Add a special development-only endpoint to check mock status
	app.get('/__mocks-status', (c) => {
		return c.json({ status: 'active', mocks: true })
	})

	// Start the server
	const port = process.env.PORT || 3000
	const server = serve({
		fetch: app.fetch,
		port: Number(port),
	})

	// Handle graceful shutdown
	const shutdown = async () => {
		console.log('\n🛑 Shutting down development server...')
		await stopMocking()
		server.close()
		process.exit(0)
	}

	process.on('SIGINT', shutdown)
	process.on('SIGTERM', shutdown)

	console.log(`🌐 Hono app is running at http://localhost:${port}`)
	console.log('🧪 Development server running with mocks enabled')
}

startDevServer().catch((error) => {
	console.error('Failed to start development server:', error)
	process.exit(1)
})
