declare namespace NodeJS {
  interface Global {
    __stryker__:
      | import('@stryker-mutator/api/core').InstrumenterContext
      | undefined;
    // used during testing, so we can actually run stryker on the @stryker-mutator/mocha-runner package itself
    __stryker2__:
      | import('@stryker-mutator/api/core').InstrumenterContext
      | undefined;
  }
}
