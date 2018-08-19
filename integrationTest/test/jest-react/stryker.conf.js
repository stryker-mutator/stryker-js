module.exports = function(config) {
  config.set({
    testRunner: "jest",
    mutator: "javascript",
    transpilers: [],
    reporters: ["event-recorder"],
    coverageAnalysis: "off",
    mutate: ["src/**/*.js", "!src/**/*.test.js"],
    maxConcurrentTestRunners: 1,
    jest: {
      project: 'react'
    }
  });
};
