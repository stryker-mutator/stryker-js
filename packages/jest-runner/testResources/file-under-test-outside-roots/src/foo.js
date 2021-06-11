// Manually instrumented out of lazy-ness 😅
if (process.env.__STRYKER_ACTIVE_MUTANT__ === '1'){
  module.exports = 0;
} else {
  module.exports = 42;
}
