type Milliseconds = number;
type Maybe<T> = void | null | undefined | T;
type Status = 'passed' | 'failed' | 'skipped' | 'pending';
type Path = string;

interface AssertionResult {
  duration?: Maybe<Milliseconds>;
  failureMessages: string[];
  fullName: string;
  status: Status;
}

interface RunCliParameters {
  config: string;
  runInBand: boolean;
  silent: boolean;
  findRelatedTests?: boolean;
  _?: string[];
}

export interface TestResult {
  failureMessage: Maybe<string>;
  testResults: Array<AssertionResult>;
}

interface AggregatedResult {
  numRuntimeErrorTestSuites: number;
  testResults: TestResult[];
}

export function runCLI(cliParams: RunCliParameters, projectRoots: Array<String>): any

export interface RunResult {
  config: Configuration;
  results: AggregatedResult;
}

export interface Configuration {
  rootDir: Maybe<Path>;
  reporters: Array<string>;
  bail: boolean;
  collectCoverage: boolean;
  verbose: boolean;
  testResultsProcessor: Maybe<string>;
  testEnvironment: string;
}
