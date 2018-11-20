module.exports = function (config) {
    config.set({
    mutate: ['src/**/*.js?(x)', '!src/**/*@(.test|.spec|Spec).js?(x)'],
    mutator: 'javascript',
    testRunner: 'jest',
    reporter: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'off',
    jest: {
      project: 'react'
    }
  });
}