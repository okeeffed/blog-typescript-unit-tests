import 'dotenv/config'
import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables
config();

export default defineConfig({
  schema: path.join("src", "db", "schema.prisma"),
  migrations: {
    path: path.join("src", "db", "migrations"),
    seed: "tsx src/db/seed.ts"
  },
  views: {
    path: path.join("src", "db", "views"),
  },
  typedSql: {
    path: path.join("src", "db", "queries"),
  }
});
