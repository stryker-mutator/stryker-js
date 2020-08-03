// This config was generated using a preset.
// Please see the handbook for more information: https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/angular.md#angular
module.exports = function(config) {
  config.set({
    mutate: [
      "src/app/catalogus/*.ts",
      "src/app/shopping-cart/*.ts",
      "src/app/services/*.ts",
      "!src/**/*.spec.ts"
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
    timeoutMS: 60000,
    reporters: ["progress", "clear-text", "html"],
    concurrency: 2,
    coverageAnalysis: 'off', // Coverage analysis with a transpiler is not supported a.t.m.
    tsconfigFile: 'tsconfig.json', // Location of your tsconfig.json file
  });
};
