/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.ts$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          target: "es2021",
          module: "commonjs",
          esModuleInterop: true,
          strict: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          rewriteRelativeImportExtensions: false,
          allowImportingTsExtensions: true,
          noEmit: true,
        },
      },
    ],
  },
};
