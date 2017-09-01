module.exports = function (config) {
  config.set({
    // files: [
    //   'test/helpers/**/*.ts',
    //   'test/unit/**/*.ts',
    //   { pattern: 'src/**/*.ts', included: false, mutated: true }
    // ],
    // { pattern: 'node_modules/stryker-api/*.js', included: false, mutated: false },
    // { pattern: 'node_modules/stryker-api/src/**/*.js', included: false, mutated: false },
    // { pattern: 'node_modules/stryker-api/*.d.ts', included: false, mutated: false },
    // { pattern: 'node_modules/stryker-api/src/**/*.d.ts', included: false, mutated: false }],
    files: [
      { pattern: 'package.json', included: false, mutated: false },
      '!test/integration/**/*.ts',
      { pattern: 'node_modules/stryker-api/*.js', included: false, mutated: false },
      { pattern: 'node_modules/stryker-api/src/**/*.js', included: false, mutated: false },
      { pattern: 'node_modules/stryker-api/*.d.ts', included: false, mutated: false },
      { pattern: 'node_modules/stryker-api/src/**/*.d.ts', included: false, mutated: false }
    ],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'html', 'clear-text', 'event-recorder'],
    coverageAnalysis: 'perTest',
    thresholds: {
      high: 80,
      low: 60,
      break: null
    },
    logLevel: 'trace',
    tsconfigFile: 'tsconfig.json',
    mutantGenerator: 'typescript',
    transpilers: [
      'typescript'
    ],
    plugins: [
      require.resolve('../stryker-mocha-runner/src/index'),
      require.resolve('../stryker-mocha-framework/src/index'),
      require.resolve('../stryker-html-reporter/src/index'),
      require.resolve('../stryker-typescript/src/index')
    ]
  });
};
