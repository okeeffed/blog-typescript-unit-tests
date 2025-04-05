import { execSync } from "node:child_process";
import { psqlContainer, valkeyContainer } from "@/lib/testcontainers";

export async function setup() {
  // Start the PostgreSQL container
  const [psql, valkey] = await Promise.all([psqlContainer, valkeyContainer]);
  const databaseUrl = psql.getConnectionUri();
  process.env.DATABASE_URL = databaseUrl;

  // Start the Valkey container
  const valkeyUrl = valkey.getConnectionUrl();
  process.env.VALKEY_URL = valkeyUrl;

  // Run migrations and seed your database
  execSync("npx prisma migrate reset --force --skip-seed", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

export async function teardown() {
  const psql = await psqlContainer;
  const valkey = await valkeyContainer;

  await Promise.all([psql.stop(), valkey.stop()]);
}
