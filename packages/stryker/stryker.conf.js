
  module.exports = function(config){
    config.set(
      {
  "files": [
    {
      "pattern": "src/**/*.js",
      "mutated": true,
      "included": false
    },
    "test/**/*.js"
  ],
  "coverageAnalysis": "perTest",
  "reporter": [
    "html",
    "progress"
  ],
  "testFramework": "mocha",
  "testRunner": "mocha"
}
    );
  }