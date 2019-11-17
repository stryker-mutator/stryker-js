module.exports = function (config) {
  config.set({
    mutate: ['src/**/*.ts'],
    coverageAnalysis: 'perTest',
    tsconfigFile: 'tsconfig.stryker.json',
    mutator: 'typescript',
    transpilers: [
      'typescript'
    ],
    mochaOptions: {
      spec: ['test/helpers/**/*.js', 'test/unit/**/*.js']
    },
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporters: ['progress', 'html', 'dashboard'],
    maxConcurrentTestRunners: 4,
    thresholds: {
      high: 80,
      low: 60,
      break: null
    },
    fileLogLevel: 'trace',
    logLevel: 'info',
    plugins: [
      require.resolve('../mocha-runner/src/index'),
      require.resolve('../mocha-framework/src/index'),
      require.resolve('../html-reporter/src/index'),
      require.resolve('../typescript/src/index'),
    ],
    dashboard: {
      project: 'github.com/' + process.env.GITHUB_REPOSITORY,
      version: process.env.GITHUB_REF.substr(11),
      module: 'html-reporter',
      reportType: 'full'
    }
  });
};

if (process.env.STRYKER_DASHBOARD_API_KEY) {
  console.log('STRYKER_DASHBOARD_API_KEY set');
} else {
  console.error('STRYKER_DASHBOARD_API_KEY missing!')
}
