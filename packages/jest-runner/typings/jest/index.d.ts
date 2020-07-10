declare namespace Jest {
  // RunCLI does not have any official types, this will do for our implementation
  function runCLI(cliParams: RunCliParameters, projectRoots: string[]): any;

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
    rootDir?: Path;
    reporters: string[];
    bail: boolean;
    collectCoverage: boolean;
    verbose: boolean;
    testResultsProcessor?: string;
    testEnvironment: string;
  }

  interface RunResult {
    results: AggregatedResult;
  }

  // Taken from https://goo.gl/h48ajP, removed all stuff that we are not using
  interface AggregatedResult {
    numRuntimeErrorTestSuites: number;
    testResults: TestResult[];
  }

  // Taken from https://goo.gl/nAzQ4J, removed all stuff that we are not using
  interface TestResult {
    failureMessage?: string | null;
    testResults: AssertionResult[];
    testExecError?: SerializableError;
  }

  interface SerializableError {
    code?: any;
    message: string;
    stack?: string | null | undefined;
    type?: string;
  }

  // Taken from https://goo.gl/drWMCB, removed all stuff that we are not using
  interface AssertionResult {
    duration?: Milliseconds | null;
    failureMessages: string[];
    fullName: string;
    status: Status;
  }

  //
  type Milliseconds = number;
  type Status = 'passed' | 'failed' | 'skipped' | 'pending' | 'todo' | 'disabled';
  type Path = string;
}
