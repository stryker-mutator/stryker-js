console.log(`Current active mutant = ${process.env.__STRYKER_ACTIVE_MUTANT__}`);
if (process.env.__STRYKER_ACTIVE_MUTANT__ === '42') {
  throw new Error('Expected error when process.env.__STRYKER_ACTIVE_MUTANT__ is 42');
}
