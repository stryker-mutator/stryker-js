// THIS FILE IS LOADED IN THE BROWSER AND SHOULD NOT BE A NODE / ES MODULE

// @ts-expect-error
const originalComplete = window.__karma__.complete.bind(window.__karma__);
// @ts-expect-error
window.__karma__.complete = (...args) => {
  // @ts-expect-error
  if (window.__strykerShouldReportCoverage__) {
    if (!args.length) {
      args.push({});
    }
    // @ts-expect-error
    const ns = window.__stryker__ || {};
    args[0].mutantCoverage = ns.mutantCoverage;
    args[0].hitCount = ns.hitCount;
  }
  originalComplete(...args);
};
