module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["./test"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
    "^.+\\.js$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  transformIgnorePatterns: ["node_modules/(?!jose/)"],
  moduleNameMapper: {
    "^(\\.\\.?\\/.*)\\.js$": "$1",
    "^(\\.\\.?\\/.*)\\.ts$": "$1",
  },
};
