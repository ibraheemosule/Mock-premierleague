/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
  // globalSetup: "<rootDir>/gs-setup.ts",
  globalTeardown: "<rootDir>/td-jest.ts",
  setupFiles: ["<rootDir>/jest.env.js"],
  moduleDirectories: ["node_modules", __dirname],
  // testTimeout: 360000,
  verbose: true,
};
