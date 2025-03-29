const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");

let container;
let prisma;

beforeAll(async () => {
  // Start a PostgreSQL container with Testcontainers
  container = await new PostgreSqlContainer("postgres:13")
    .withDatabase("testdb")
    .withUsername("testuser")
    .withPassword("testpass")
    .start();

  // Set the DATABASE_URL environment variable for Prisma
  const url = container.getConnectionUri();

  process.env.DATABASE_URL = url;

  // Apply the Prisma schema to the new container (creates the tables)
  // This uses Prisma’s "db push" command which syncs your schema to the database
  execSync("npx prisma db push", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: container.getConnectionUri() },
  });

  // Initialize Prisma client and connect to the database
  prisma = new PrismaClient();
  await prisma.$connect();

  // Seed the database with a sample user
  await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@example.com",
    },
  });
}, 20000);

afterAll(async () => {
  // Disconnect Prisma and stop the container
  await prisma.$disconnect();
  await container.stop();
});

test("should retrieve seeded user", async () => {
  const user = await prisma.user.findUnique({
    where: { email: "alice@example.com" },
  });
  expect(user).toBeDefined();
  expect(user.name).toEqual("Alice");
});
