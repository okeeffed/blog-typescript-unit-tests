// src/test-utils/containers.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { ValkeyContainer } from '@testcontainers/valkey'
import { execSync } from 'node:child_process'
import { PrismaClient } from '@prisma/client'
import { Network, StartedNetwork } from 'testcontainers'

interface ContainerInfo {
	postgresConnectionString: string
	valkeyConnectionString: string
	cleanup: () => Promise<void>
}

export async function startTestContainers(): Promise<ContainerInfo> {
	// Create a network for the containers to communicate
	const network: StartedNetwork = await new Network().start()

	// Start a PostgreSQL container with Testcontainers
	const postgresContainer = await new PostgreSqlContainer("postgres:13")
		.withDatabase("testdb")
		.withUsername("testuser")
		.withPassword("testpass")
		.withNetwork(network)
		.start();

	// Set the DATABASE_URL environment variable for Prisma
	const url = postgresContainer.getConnectionUri();

	process.env.DATABASE_URL = url;

	// Apply the Prisma schema to the new container (creates the tables)
	// This uses Prisma’s "db push" command which syncs your schema to the database
	execSync("npx prisma db push", {
		stdio: "inherit",
		env: { ...process.env, DATABASE_URL: postgresContainer.getConnectionUri() },
	});

	// Initialize Prisma client and connect to the database
	const prisma = new PrismaClient();
	await prisma.$connect();

	// Start Valkey container (formerly Redis compatible)
	const valkeyContainer = await new ValkeyContainer("valkey/valkey:8.0")
		.withNetwork(network)
		.start()

	// Set the VALKEY_URL environment variable for Valkey
	const valkeyUrl = valkeyContainer.getConnectionUrl();
	console.log('Valkey URL:', valkeyUrl)
	process.env.VALKEY_URL = valkeyUrl;


	// Return connection info and cleanup function
	return {
		postgresConnectionString: url,
		valkeyConnectionString: valkeyUrl,
		cleanup: async () => {
			await postgresContainer.stop()
			await valkeyContainer.stop()
		}
	}
}
