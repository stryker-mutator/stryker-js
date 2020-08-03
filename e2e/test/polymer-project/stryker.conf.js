module.exports = function(config) {
  config.set({
    mutator: "javascript",
    packageManager: "npm",
    reporters: ["event-recorder", "clear-text", "progress"],
    testRunner: "wct",
    transpilers: [],
    coverageAnalysis: "off",
    mutate: ["paper-button.js"],
    wct: {
      npm: true
    },
    concurrency: 2,
    timeoutMS: 30000
  });
};
