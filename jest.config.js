module.exports = {
  testURL: "http://localhost/",
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/src/__tests__/**",
    "!**/src/index.ts",
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
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
