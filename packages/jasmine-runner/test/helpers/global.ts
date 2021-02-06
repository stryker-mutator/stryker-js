// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace NodeJS {
  interface Global {
    __testsInCurrentJasmineRun: string[];
  }
}
