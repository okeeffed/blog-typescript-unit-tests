import { psqlContainer, valkeyContainer } from "../lib/testcontainers";


export default async function globalTeardown() {
	const psql = await psqlContainer;
	const valkey = await valkeyContainer;

	await Promise.all([psql.stop(), valkey.stop()])
}
