module.exports = function (config) {
  config.set({
    testRunner: "jest",
    reporters: ["event-recorder", "html", "progress", "clear-text"],
    tempDirName: "stryker-tmp",
    coverageAnalysis: "off",
    timeoutMS: 60000, // High timeout to survive high build server load. Mutants created here should never timeout
    mutate: ["src/{Alert,Badge,Breadcrumb}.js"],
    concurrency: 2,
    jest: {
      projectType: 'create-react-app'
    }
  });
};
