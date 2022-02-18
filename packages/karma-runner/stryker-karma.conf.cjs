/**
 * Temp workaround until karma supports importing native es modules
 * @see https://github.com/karma-runner/karma/issues/3677#issuecomment-1009963597
 * 
 * Or until native support for node's module system is added to typescript (.cts files, so we can move this file back in the src directory)
 * @see https://www.typescriptlang.org/docs/handbook/esm-node.html
 */
module.exports = function (config) {
  return import('./dist/src/karma-plugins/stryker-karma.conf.js').then((mod) => mod.configureKarma(config));
};
