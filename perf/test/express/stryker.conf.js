/**
 * This folder contains a copy of Express.
 * Repository: https://github.com/expressjs/express
 * Commit: 5596222f6a6e0eea74f6fb38915b071d98122a2f (master, 31-07-2020)
 *
 * This benchmark covers the following use case:
 * - Common JS with no instrumentation
 * - Mocha test framework
 * - Decently sized project (1800 lines of source code, 4064 lines total)
 * - Well tested (1043 tests)
 *
 * Minimal changes have been made to make Express a useful benchmark:
 * - Add Stryker config (this file)
 * - Add Stryker dependencies to package.json
 * - Add npm script `stryker` to package.json
 * - Skip one test that failed in Stryker@3 due to a bug:
 *   "Files and folders with emoji in their paths are ignored by Stryker #2418"
 * - Delete folders unrelated to mutation testing. This should make cloning the
 *   Stryker repository a bit faster.
 *    - `./examples`
 *    - `./benchmarks`
 *
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  mutator: 'javascript',
  packageManager: 'npm',
  reporters: [
    'progress',
    'clear-text',
  ],
  testRunner: 'mocha',
  transpilers: [],
  testFramework: 'mocha',
  coverageAnalysis: 'perTest',
};
