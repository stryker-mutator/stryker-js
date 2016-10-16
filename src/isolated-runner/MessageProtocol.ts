import { RunResult, RunnerOptions } from 'stryker-api/test_runner';
import { RunOptions } from 'stryker-api/test_runner';

export type AdapterMessage = RunMessage | StartMessage | EmptyAdapterMessage;
export type WorkerMessage = ResultMessage | EmptyWorkerMessage;

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
}

export interface EmptyAdapterMessage {
  kind: 'init' | 'dispose';
}

export interface EmptyWorkerMessage {
  kind: 'initDone' | 'disposeDone';
}