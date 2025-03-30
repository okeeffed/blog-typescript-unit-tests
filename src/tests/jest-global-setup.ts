import { execSync } from "child_process";
import { psqlContainer, valkeyContainer } from '../lib/testcontainers'

export default async function globalSetup() {
	// Start the PostgreSQL container
	const [psql, valkey] = await Promise.all([psqlContainer, valkeyContainer]);
	const databaseUrl = psql.getConnectionUri();
	process.env.DATABASE_URL = databaseUrl;

	// Start the Valkey container
	const valkeyUrl = valkey.getConnectionUrl();
	process.env.VALKEY_URL = valkeyUrl;

	// Run migrations and seed your database
	execSync("npx prisma db push && npx prisma db seed", {
		stdio: "inherit",
		env: { ...process.env, DATABASE_URL: databaseUrl },
	});

}
