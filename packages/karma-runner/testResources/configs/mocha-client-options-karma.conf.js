module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    browsers: ['ChromeHeadless'],
    files: [
      require.resolve('./mocha-client-options-echo-ui.spec.js')
    ],
    client: {
      mocha: {
        global: ['jQuery'],
        ui: 'tdd',
        bail: false // should be overridden by Stryker
      }
    },
    singleRun: true
  });
};
