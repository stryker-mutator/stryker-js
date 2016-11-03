module.exports = function (config) {
  config.set({
    files: ['test/helpers/**/*.js', 'test/unit/**/*.js', { pattern: 'src/**/*.js', included: false, mutated: true }],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'clear-text', 'html', 'event-recorder'],
    testFramework: null,
    plugins: ['stryker-mocha-runner', 'stryker-html-reporter']
  });
}
