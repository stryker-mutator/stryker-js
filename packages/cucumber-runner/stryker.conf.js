const path = require('path');
/**
 * @type {import('@stryker-mutator/api/src-generated/stryker-core').StrykerOptions & import('../mocha-runner/src-generated/mocha-runner-options').MochaRunnerOptions}
 */
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
settings.plugins = settings.plugins.map(p => path.resolve(p));
settings.dashboard.module = moduleName;
settings.mochaOptions.spec =  ["dist/test/integration/**/*.js"];
module.exports = settings;

