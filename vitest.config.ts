import { defineConfig } from 'vite'

export default defineConfig({
	resolve: {
		alias: {
			'@': '/src',
		},
	},
	test: {
		coverage: {
			reporter: ['text', 'lcov'], // 'text' = terminal, 'lcov' = HTML output
		},
		// Run tets in a single process
		pool: 'forks',
		sequence: {
			concurrent: false
		},
		globalSetup: [
			'./src/tests/vitest-global-setup.ts',
		],
		setupFiles: ['./src/tests/vitest-setup.ts']
	},
})
