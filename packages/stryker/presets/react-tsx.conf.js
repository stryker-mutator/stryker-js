module.exports = function (config) {
    config.set({
    mutate: ['src/**/*.ts?(x)', '!src/**/*@(.test|.spec|Spec).ts?(x)'],
    mutator: 'typescript',
    testRunner: 'jest',
    reporter: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'off',
    jest: {
      project: 'react'
    }
  });
}