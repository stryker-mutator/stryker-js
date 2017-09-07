module.exports = function (config) {

  var typescript = true;

  if (typescript) {
    config.set({
      files: [
        { pattern: 'package.json', included: false, mutated: false },
        '!test/integration/**/*.ts',
        '!src/**/*.ts',
        { pattern: 'src/**/*.ts', included: false, mutated: true },
        { pattern: 'node_modules/stryker-api/*.js', included: false, mutated: false, transpiled: false },
        { pattern: 'node_modules/stryker-api/src/**/*.js', included: false, mutated: false, transpiled: false }
      ],
      coverageAnalysis: 'off',
      tsconfigFile: 'tsconfig.json',
      mutantGenerator: 'typescript',
      transpilers: [
        'typescript'
      ]
    })
  } else {
    config.set({
      files: [
        'test/helpers/**/*.js',
        'test/unit/**/*.js',
        { pattern: 'src/**/*.js', included: false, mutated: true },
        { pattern: 'node_modules/stryker-api/*.js', included: false, mutated: false },
        { pattern: 'node_modules/stryker-api/src/**/*.js', included: false, mutated: false }
      ],
      coverageAnalysis: 'off',
      mutantGenerator: 'es5'
    });
  }

  config.set({
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'html', 'clear-text', 'event-recorder'],
    thresholds: {
      high: 80,
      low: 60,
      break: null
    },
    logLevel: 'info',
    plugins: [
      require.resolve('../stryker-mocha-runner/src/index'),
      require.resolve('../stryker-mocha-framework/src/index'),
      require.resolve('../stryker-html-reporter/src/index'),
      require.resolve('../stryker-typescript/src/index')
    ]
  });
};