/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
  setupFiles: ["<rootDir>/jest.env.js"],
  moduleDirectories: ["node_modules", __dirname],
  verbose: true,
};
