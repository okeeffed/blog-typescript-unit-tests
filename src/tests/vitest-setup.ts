import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { container } from "@/config/ioc-test";
import { server } from "@/shared/mocks/server";

const keyv = container.resolve("keyvClient");
const prisma = container.resolve("prismaClient");

/**
 * Clean all tables in the database
 */
async function cleanDatabase() {
  // Get all tables
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename::text FROM pg_tables 
    WHERE schemaname='public' 
    AND tablename NOT IN ('_prisma_migrations')
  `;

  // Truncate each table
  for (const { tablename } of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE "${tablename}" CASCADE;`);
    } catch (error) {
      console.log(`Error truncating ${tablename}`);
    }
  }
}

beforeAll(async () => {
  server.listen({ onUnhandledRequest: "bypass" });
}, 30000);

beforeEach(async () => {
  // Clean the database before each test to start fresh
  await cleanDatabase();
});

afterEach(async () => {
  await keyv.clear();
  server.resetHandlers();
});

afterAll(async () => {
  server.close();

  await prisma.$disconnect();
  await keyv.disconnect();
});
