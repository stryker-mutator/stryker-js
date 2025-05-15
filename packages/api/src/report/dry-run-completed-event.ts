import {
  CompleteDryRunResult,
  TestRunnerCapabilities,
} from '../test-runner/index.js';

export interface DryRunCompletedEvent {
  result: CompleteDryRunResult;
  timing: RunTiming;
  capabilities: TestRunnerCapabilities;
}

export interface RunTiming {
  /**
   * The time that the test runner was actually executing tests in milliseconds.
   */
  net: number;
  /**
   * the time that was spend not executing tests in milliseconds.
   * So the time it took to start the test runner and to report the result.
   */
  overhead: number;
}
