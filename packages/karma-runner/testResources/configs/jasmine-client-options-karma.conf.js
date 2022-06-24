module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['ChromeHeadless'],
    files: [require.resolve('./jasmine-client-options-echo-ui.spec.js')],
    client: {
      jasmine: {
        random: true,
        stopSpecOnExpectationFailure: true,
        stopOnSpecFailure: false,
        timeoutInterval: 1000,
      },
    },
    singleRun: true,
  });
};
