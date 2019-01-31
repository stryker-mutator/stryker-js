// This config was generated using a preset.
// Please see the handbook for more information: https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/angular.md#angular
module.exports = function(config) {
  config.set({
    mutate: [
      "src/**/*.ts",
      "!src/**/*.spec.ts",
      "!src/test.ts",
      "!src/environments/*.ts",
      "!src/app/app.module.ts"
    ],

    mutator: "typescript",
    testRunner: "karma",
    karma: {
      configFile: "src/karma.conf.js",
      projectType: "angular-cli",
      config: {
        browsers: ["ChromeHeadless"]
      }
    },
    reporters: ["progress", "clear-text", "html"],
    maxConcurrentTestRunners: 2, // Recommended to use about half of your available cores when running stryker with angular.
    coverageAnalysis: 'off', // Coverage analysis with a transpiler is not supported a.t.m.
    tsconfigFile: 'tsconfig.json', // Location of your tsconfig.json file
  });
};
