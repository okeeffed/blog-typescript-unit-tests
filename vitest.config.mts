import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Plugin to suppress Prisma source map warnings
function suppressPrismaSourceMapWarnings() {
  const originalStderrWrite = process.stderr.write;
  
  process.stderr.write = function(chunk: any, ...args: any[]) {
    const message = chunk.toString();
    // Suppress source map warnings specifically for Prisma runtime files
    if (message.includes('Failed to load source map') && message.includes('src/db/runtime')) {
      return true; // Don't write this message
    }
    return originalStderrWrite.call(this, chunk, ...args);
  } as any;

  return {
    name: 'suppress-prisma-warnings',
    configResolved() {
      // Plugin loaded
    }
  };
}

export default defineConfig({
  plugins: [tsconfigPaths(), suppressPrismaSourceMapWarnings()],
  test: {
    setupFiles: ["./src/tests/vitest-setup.ts", "./src/tests/matchers.ts"],
    coverage: {
      reporter: ["text", "lcov"],
      exclude: [
        "src/tests",
        "src/proxies",
        "src/mocks",
        "src/config",
        "src/lib",
        "src/decorators",
        "prisma",
        "vitest.config.ts",
        "src/dev-entry.ts",
        "src/index.ts",
        "src/schemas.ts",
      ],
    },
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    globalSetup: ["./src/tests/vitest-global-setup.ts"],
  },
});
