declare namespace Jest {
  // RunCLI does not have any official types, this will do for our implementation
  function runCLI(cliParams: RunCliParameters, projectRoots: Array<String>): any 

  // Taken from https://goo.gl/qHifyP, removed all stuff that we are not using
  // Also added 'runInBand' which does not exist in the official types
  interface RunCliParameters {
    config: string;
    runInBand: boolean;
    silent: boolean;
    findRelatedTests?: boolean;
    _?: string[];
  }

  // Taken from https://goo.gl/qHifyP, removed all stuff that we are not using
  interface Configuration {
    rootDir: Maybe<Path>;
    reporters: Array<string>;
    bail: boolean;
    collectCoverage: boolean;
    verbose: boolean;
    testResultsProcessor: Maybe<string>;
    testEnvironment: string;
  }

  interface RunResult {
    config: Configuration;
    results: AggregatedResult;
  }

  // Taken from https://goo.gl/h48ajP, removed all stuff that we are not using
  interface AggregatedResult {
      numRuntimeErrorTestSuites: number;
      testResults: TestResult[];
  }

  // Taken from https://goo.gl/nAzQ4J, removed all stuff that we are not using
  interface TestResult {
    failureMessage: Maybe<string>;
    testResults: Array<AssertionResult>;
  }

  // Taken from https://goo.gl/drWMCB, removed all stuff that we are not using
  interface AssertionResult {
    duration?: Maybe<Milliseconds>;
    failureMessages: string[];
    fullName: string;
    status: Status;
  }

  // 
  type Milliseconds = number;
  type Maybe<T> = void | null | undefined | T;
  type Status = 'passed' | 'failed' | 'skipped' | 'pending';
  type Path = string;
}

declare module "jest" {
  export default Jest;
}