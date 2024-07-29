/**
 * Grabbed from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/jasmine,
 *
 * Removed anything that we're not using.
 */
export interface SuiteInfo {
  totalSpecsDefined: number;
}
export interface CustomReportExpectation {
  matcherName: string;
  message: string;
  passed: boolean;
  stack: string;
}
export interface CustomReporterResult {
  description: string;
  failedExpectations?: FailedExpectation[];
  fullName: string;
  id: string;
  passedExpectations?: PassedExpectation[];
  pendingReason?: string;
  status?: string;
}
export interface FailedExpectation extends CustomReportExpectation {
  actual: string;
  expected: string;
}

export type PassedExpectation = CustomReportExpectation;
export interface RunDetails {
  failedExpectations: ExpectationResult[];
  order: Order;
}
export interface Trace {
  name: string;
  message: string;
  stack: any;
}
export interface ExpectationResult extends Result {
  matcherName: string;
  passed(): boolean;
  expected: any;
  actual: any;
  message: string;
  trace: Trace;
}
export interface Result {
  type: string;
}
export interface Order {
  new (options: { random: boolean; seed: string }): any;
  random: boolean;
  seed: string;
  sort<T>(items: T[]): T[];
}
export interface CustomReporter {
  jasmineStarted?(suiteInfo: SuiteInfo): void;
  suiteStarted?(result: CustomReporterResult): void;
  specStarted?(result: CustomReporterResult): void;
  specDone?(result: CustomReporterResult): void;
  suiteDone?(result: CustomReporterResult): void;
  jasmineDone?(runDetails: RunDetails): void;
}

interface Spec {
  getFullName(): string;
}

export interface Env {
  addReporter(reporter: CustomReporter): void;
  specFilter(spec: Spec): boolean;
}
export class Jasmine {
  getEnv(): Env;
}
