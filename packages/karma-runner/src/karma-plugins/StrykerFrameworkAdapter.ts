// @ts-expect-error
const originalComplete = window.__karma__.complete.bind(window.__karma__);
// @ts-expect-error
window.__karma__.complete = (...args) => {
  // @ts-expect-error
  window.__karma__.info('test');
  originalComplete(...args);
};
