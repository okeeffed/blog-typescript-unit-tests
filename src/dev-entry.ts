// src/dev-server.ts
import "dotenv/config";
import "reflect-metadata";

import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { app } from "./index";
import { setupMockServer } from "./mocks/server";

async function startDevServer() {
  console.log("🚀 Starting development server with mocks...");

  // 2. Initialize MSW for API mocking
  const { startMocking, stopMocking } = setupMockServer();
  await startMocking();
  console.log("🔄 API mocks initialized");

  // Import your routes and middleware here
  // e.g., app.route('/', yourRoutes)

  // Add a special development-only endpoint to check mock status
  app.get("/__mocks-status", (c) => {
    return c.json({ status: "active", mocks: true });
  });

  app.doc31("/openapi", {
    openapi: "3.1.0",
    info: {
      title: "Hono API",
      version: "1.0.0",
      description: "Greeting API",
    },
    servers: [{ url: "http://localhost:3000", description: "Local Server" }],
  });

  app.get("/swagger", swaggerUI({ url: "/openapi" }));

  const apiModule = await import("@scalar/hono-api-reference");
  // If the module exports a default, you might need to access it like this:
  const apiReference = apiModule.apiReference;

  app.get(
    "/docs",
    apiReference({
      theme: "saturn",
      url: "/openapi",
    }),
  );

  // Start the server
  const port = process.env.PORT || 3000;
  const server = serve({
    fetch: app.fetch,
    port: Number(port),
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log("\n🛑 Shutting down development server...");
    await stopMocking();
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(`🌐 Hono app is running at http://localhost:${port}`);
  console.log("🧪 Development server running with mocks enabled");
}

startDevServer().catch((error) => {
  console.error("Failed to start development server:", error);
  process.exit(1);
});
