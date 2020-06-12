declare namespace NodeJS {
  interface Global {
    __activeMutant__: number | undefined;
    __currentTestId__: string | undefined;
    __mutantCoverage__: import('@stryker-mutator/api/test_runner2').MutantCoverage | undefined;
  }
}
