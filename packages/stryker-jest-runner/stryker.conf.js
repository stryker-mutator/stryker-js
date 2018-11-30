module.exports = function(config) {
  config.set({
    mutate: [
      'src/**/*.ts',
      '!src/index.ts'
    ],
    testRunner: {
      name: 'mocha',
      settings: {
        config: {
          files: [
            'test/helpers/**/*.js',
            'test/unit/**/*.js'
          ]
        }
      }
    },
    testFramework: 'mocha',
    mutator: 'typescript',
    transpilers: ['typescript'],
    reporters: ['clear-text', 'progress', 'html', 'dashboard'],
    tsconfigFile: 'tsconfig.json',
    coverageAnalysis: 'perTest',
    logLevel: 'info'
  });
};