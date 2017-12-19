module.exports = function(config) {
  config.set({
    files: [
      '!src/**/*.ts',
      '!**/*.d.ts',
      { pattern: 'src/**/*.ts', included: false, mutated: true },
      '!src/helpers/HybridFs.ts',
      { pattern: 'src/helpers/HybridFs.ts', included: false, mutated: false },
      '!./src/index.ts'
    ],
    testRunner: "mocha",
    testFramework: "mocha",
    mutator: "typescript",
    transpilers: ["typescript"],
    reporter: ["clear-text", "progress", "html"],
    tsconfigFile: "tsconfig.json",
    coverageAnalysis: "off",
    logLevel: "info"
  });
};
