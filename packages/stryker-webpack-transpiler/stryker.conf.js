module.exports = function (config) {
  config.set({
    files: [
      '!src/**/*.ts',
      '!**/*.d.ts',
      { pattern: 'src/**/*.ts', included: false, mutated: true },
      '!./src/index.ts',
      { pattern: 'testResources/**/+(*.js|*.txt)', transpiled: false, included: false }
    ],
    testRunner: "mocha",
    testFramework: "mocha",
    mutator: "typescript",
    transpilers: ["typescript"],
    reporter: ["clear-text", "progress", "html"],
    tsconfigFile: "tsconfig.json",
    coverageAnalysis: "off",
    logLevel: "info",
    thresholds: {
      high: 90,
      low: 80,
      break: 60
    },
    plugins: [
      '../../../stryker-html-reporter/src/index',
      '../../../stryker-mocha-runner/src/index',
      '../../../stryker-mocha-framework/src/index',
      '../../../stryker-typescript/src/index'
    ]
  });

  if (process.env.TRAVIS) {
    config.set({
      maxConcurrentTestRunners: 2
    });
  }
};
