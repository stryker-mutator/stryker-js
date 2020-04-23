const path = require('path');
/**
 * @type {import('@stryker-mutator/api/src-generated/stryker-core').StrykerOptions & import('./src-generated/mocha-runner-options').MochaRunnerOptions & import('../typescript/src-generated/typescript-options').TypescriptOptions}
 */
const settings = require('../../stryker.parent.conf');
const moduleName = __dirname.split(path.sep).pop();
settings.dashboard.module = moduleName;
module.exports = settings;
settings.mochaOptions['async-only'] = 'true';
settings.tsconfig = 'tsconfig.json';

