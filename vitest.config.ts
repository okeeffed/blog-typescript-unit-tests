
import { defineConfig } from 'vite'

export default defineConfig({
	resolve: {
		alias: {
			'@': '/src',
		},
	},
	test: {
		coverage: {
			reporter: ['text', 'lcov'],
			exclude: [
				'src/tests',
				'src/proxies',
				'src/mocks',
				'src/config',
				'src/lib',
				'src/decorators',
				'prisma',
				'vitest.config.ts',
				'src/dev-entry.ts',
				'src/index.ts',
				'src/schemas.ts'
			]
		},
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true
			}
		},
		globalSetup: ['./src/tests/vitest-global-setup.ts'],
		setupFiles: ['./src/tests/vitest-setup.ts', './src/tests/matchers.ts'],
	},
})

