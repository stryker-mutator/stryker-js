const { mixinJestEnvironment} = require('@stryker-mutator/jest-runner');
const NodeEnvironment = require('jest-environment-node');

module.exports = mixinJestEnvironment(NodeEnvironment);
