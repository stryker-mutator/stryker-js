const instrumenterContext =
  global[global.__strykerGlobalNamespace__] ??
  (global[global.__strykerGlobalNamespace__] = {});
global.jasmine.getEnv().addReporter({
  specStarted(spec) {
    instrumenterContext.currentTestId = spec.fullName;
  },
});
