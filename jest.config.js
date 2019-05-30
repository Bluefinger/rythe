/* eslint-env node */

module.exports = {
  preset: "ts-jest",
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/tests/**",
    "!**/src/**/index.ts",
    "!**/dist/**",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/.rpt2_cache/**",
    "!**/.vscode/**"
  ],
  coverageDirectory: "./coverage",
  coverageReporters: ["html", "text"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: -10
    }
  },
  globals: {
    "ts-jest": {
      tsConfig: "./tests/tsconfig.json"
    }
  },
  testMatch: null,
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testEnvironment: "node",
  moduleNameMapper: {
    "^rythe$": "<rootDir>/src/",
    "^rythe/(.*)$": "<rootDir>/src/$1"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
