declare namespace NodeJS {
  interface Global {
    __stryker__: import('@stryker-mutator/api/core').InstrumenterContext | undefined;
    // used during testing, so we can actually run stryker on the @stryker-mutator/jasmine-runner package itself
    __stryker2__: import('@stryker-mutator/api/core').InstrumenterContext | undefined;

    __strykerGlobalNamespace__: '__stryker__' | '__stryker2__';

    jasmine: import('./jasmine').Jasmine;
  }
}
