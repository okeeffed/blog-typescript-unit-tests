import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { ValkeyContainer } from '@testcontainers/valkey'

export const psqlContainer = new PostgreSqlContainer("postgres:15")
	.withDatabase("testdb")
	.withUsername("testuser")
	.withPassword("testpass")
	.start()

// Start Valkey container
export const valkeyContainer = new ValkeyContainer("valkey/valkey:8.0")
	.start()

