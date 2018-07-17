import { RunResult, RunnerOptions } from 'stryker-api/test_runner';
import { RunOptions } from 'stryker-api/test_runner';
import LoggingClientContext from '../logging/LoggingClientContext';

export type AdapterMessage = RunMessage | StartMessage | EmptyAdapterMessage;
export type WorkerMessage = ResultMessage | EmptyWorkerMessage | InitDoneMessage;

export interface ResultMessage {
  kind: 'result';
  result: RunResult;
}

export interface RunMessage {
  kind: 'run';
  runOptions: RunOptions;
}

export interface StartMessage {
  kind: 'start';
  runnerName: string;
  runnerOptions: RunnerOptions;
  sandboxWorkingDirectory: string;
  loggingContext: LoggingClientContext;
}

export interface InitDoneMessage {
  kind: 'initDone';
  errorMessage: string | null;
}

export interface EmptyAdapterMessage {
  kind: 'init' | 'dispose';
}

export interface EmptyWorkerMessage {
  kind: 'disposeDone';
}