/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/jest-setup-after-env.ts"],
  "coveragePathIgnorePatterns": [
    "node_modules",
    "<rootDir>/src/mocks/*",
    "<rootDir>/src/schema/*"
  ],
  moduleNameMapper: {
    // Jest doesn't know how to resolve package exports correctly
    // "@auspayplus/service-common-util/aws": "@auspayplus/service-common-util/dist/aws",
    "@/(.*)": "<rootDir>/src/$1",
  },
  globalSetup: "<rootDir>/src/tests/jest-global-setup.ts",
  globalTeardown: "<rootDir>/src/tests/jest-global-teardown.ts",
};
