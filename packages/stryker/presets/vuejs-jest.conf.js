module.exports = function (config) {
    config.set({
      mutate: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.vue'],
      mutator: 'vue',
      testRunner: 'jest',
      jest: {
        // config: require('path/to/your/custom/jestConfig.js')
      },
      reporter: ['progress', 'clear-text', 'html'],
      coverageAnalysis: 'off'
    });
  };