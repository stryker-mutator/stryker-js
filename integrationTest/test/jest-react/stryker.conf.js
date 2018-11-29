module.exports = function (config) {
  config.set({
    testRunner: "jest",
    mutator: "javascript",
    transpilers: [],
    reporters: ["event-recorder"],
    coverageAnalysis: "off",
    fileLogLevel: "trace",
    mutate: ["src/{Alert,Badge,Breadcrumb}.js"],
    maxConcurrentTestRunners: 2,
    jest: {
      projectType: 'react'
    }
  });
};
