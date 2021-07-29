// THIS FILE IS LOADED IN THE BROWSER AND SHOULD NOT BE A NODE / ES MODULE

// @ts-expect-error
const originalComplete = window.__karma__.complete.bind(window.__karma__);
// @ts-expect-error
window.__karma__.complete = (...args) => {
  function firstArg() {
    if (!args.length) {
      args.push({});
    }
    return args[0];
  }
  // @ts-expect-error
  const ns = window.__stryker__ || {};
  // @ts-expect-error
  if (window.__strykerShouldReportCoverage__) {
    firstArg().mutantCoverage = ns.mutantCoverage;
  }
  if (ns.hitCount !== undefined) {
    firstArg().hitCount = ns.hitCount;
  }
  originalComplete(...args);
};
