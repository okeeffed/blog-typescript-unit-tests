// src/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

export function setupMockServer() {
	return {
		startMocking: async () => {
			server.listen({ onUnhandledRequest: 'bypass' })
		},
		stopMocking: async () => {
			server.close()
		},
		resetHandlers: () => {
			server.resetHandlers()
		},
	}
}
