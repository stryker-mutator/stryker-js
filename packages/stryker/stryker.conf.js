module.exports = function (config) {

  var typescript = true;
  var es6 = true;

  if (typescript) {
    config.set({
      files: [
        'node_modules/stryker-api/*.@(js|map)',
        'node_modules/stryker-api/src/**/*.@(js|map)',
        'package.json',
        'src/**/*.ts',
        '!src/**/*.d.ts',
        'test/**/*.ts',
        '!test/**/*.d.ts'
      ],
      symlinkNodeModules: false,
      mutate: ['src/Stryker.ts'],
      coverageAnalysis: 'perTest',
      tsconfigFile: 'tsconfig.json',
      mutator: 'typescript',
      transpilers: [
        'typescript'
      ],
      mochaOptions: {
        files: ['test/helpers/**/*.js', 'test/unit/**/*.js']
      }
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
      coverageAnalysis: 'perTest',
      mutator: es6 ? 'javascript' : 'es5'
    });
  }

  config.set({
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'html', 'clear-text', 'event-recorder', 'dashboard'],
    maxConcurrentTestRunners: 5,
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
      require.resolve('../stryker-typescript/src/index'),
      require.resolve('../stryker-javascript-mutator/src/index')
    ]
  });
};
