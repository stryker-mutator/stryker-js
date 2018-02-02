module.exports = function (config) {
  config.set({
    files: [
      '!src/**/*.ts',
      { pattern: 'src/**/*.ts', included: false, mutated: true },
      '!**/*.d.ts',
      '!./src/index.ts',
      { pattern: 'testResources/**/*.*', transpiled: false, included: false }
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
      high: 95,
      low: 90,
      break: 90
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
