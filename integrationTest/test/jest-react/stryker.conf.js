module.exports = function (config) {
  config.set({
    testRunner: {
      name: "jest",
      settings: {
        projectType: 'react'
      }
    },
    mutator: "javascript",
    transpilers: [],
    reporters: ["event-recorder"],
    coverageAnalysis: "off",
    timeoutMS: 60000, // High timeout to survive high build server load. Mutants created here should never timeout
    mutate: ["src/{Alert,Badge,Breadcrumb}.js"],
    maxConcurrentTestRunners: 2,
  });
};
