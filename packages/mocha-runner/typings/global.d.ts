declare namespace NodeJS {
  interface Global {
    [strykerGlobal: string]: import('@stryker-mutator/api/core').InstrumenterContext | undefined;
  }
}
