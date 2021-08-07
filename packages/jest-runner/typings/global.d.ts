export {}

declare global {
    var __stryker__: import('@stryker-mutator/api/core').InstrumenterContext | undefined;
    // used during testing, so we can actually run stryker on the @stryker-mutator/jasmine-runner package itself
    var __stryker2__: import('@stryker-mutator/api/core').InstrumenterContext | undefined;

    var __strykerGlobalNamespace__: '__stryker__' | '__stryker2__';

    var jasmine: import('./jasmine').Jasmine;
}
