/**
 * Jest uses a module called "exit" to exit when using `--bail` mode.
 * It works by monkey-patching the `write` function from stdout and stderr, making the process completely silent, before calling `process.exit` directly.
 * Stryker doesn't play nice with these side effects. In order to fix that, we use this very very very dirty hack to monkey-patch the monkey-patch.
 *
 * It overrides the implementation of `require('exit')` with an empty function. For this to work, it needs to be required before `jest` itself is required.
 * Did I mention this hack is dirty?
 *
 * @see https://github.com/cowboy/node-exit
 */

try {
  const exitModuleId = require.resolve('exit', { paths: [require.resolve('jest', { paths: [process.cwd()] })] });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(exitModuleId);
  const exitModule = module.children.find((mdl) => mdl.id === exitModuleId);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  exitModule!.exports = () => {};
} catch (error) {
  console.log('Unable to monkey-patch exit module', error);
}
