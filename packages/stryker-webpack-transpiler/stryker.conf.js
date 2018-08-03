module.exports = function (config) {
  config.set({
    mutate: [
      'src/WebpackTranspiler.ts',
      '!src/**/*.d.ts',
      '!src/enhanced-resolve.ts',
      '!src/index.ts'
    ],
    testRunner: "mocha",
    testFramework: "mocha",
    mutator: "typescript",
    transpilers: ["typescript"],
    reporter: ["clear-text", "progress", "html"],
    tsconfigFile: "tsconfig.json",
    maxConcurrentTestRunners: 4,
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
    ],
    mochaOptions: {
      files: 'test/**/*.js'
    }
  });

  if (process.env.TRAVIS) {
    config.set({
      maxConcurrentTestRunners: 2
    });
  }
};



