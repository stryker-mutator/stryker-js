// THIS FILE IS LOADED IN THE BROWSER AND SHOULD NOT BE A NODE / ES MODULE

// @ts-expect-error window is not defined
const originalComplete = window.__karma__.complete.bind(window.__karma__);
// @ts-expect-error window is not defined
window.__karma__.complete = (...args) => {
  function firstArg() {
    if (!args.length) {
      args.push({});
    }
    return args[0];
  }
  // @ts-expect-error window is not defined
  const context = window.__stryker__ || {};
  // @ts-expect-error window is not defined
  if (window.__strykerShouldReportCoverage__) {
    firstArg().mutantCoverage = context.mutantCoverage;
  }
  if (context.hitCount !== undefined) {
    firstArg().hitCount = context.hitCount;
  }
  originalComplete(...args);
};
