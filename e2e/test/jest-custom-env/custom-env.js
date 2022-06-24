const { mixinJestEnvironment } = require('@stryker-mutator/jest-runner');
const { TestEnvironment } = require('jest-environment-node');

module.exports = mixinJestEnvironment(TestEnvironment);
