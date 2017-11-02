module.exports = function(config) {
  config.set({
    files: [
      '!src/**/*.ts',
      '!**/*.d.ts',
      '!test/integration/**/*.ts',
      { pattern: 'src/**/*.ts', included: false, mutated: true },
      { pattern: 'testResources/**/*.js', included: false, mutated: false, transpiled: false }
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
