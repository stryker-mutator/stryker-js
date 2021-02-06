import { StrykerOptions } from '@stryker-mutator/api/core';

import { LoggingClientContext } from '../logging';

export enum WorkerMessageKind {
  'Init',
  'Call',
  'Dispose',
}

export enum ParentMessageKind {
  'Initialized',
  'Result',
  'Rejection',
  'DisposeCompleted',
}

export type WorkerMessage = CallMessage | DisposeMessage | InitMessage;
export type ParentMessage = RejectionResult | WorkResult | { kind: ParentMessageKind.DisposeCompleted | ParentMessageKind.Initialized };

// Make this an unlikely command line argument
// (prevents incidental start of child process)
export const autoStart = 'childProcessAutoStart12937129s7d';

export interface InitMessage {
  kind: WorkerMessageKind.Init;
  loggingContext: LoggingClientContext;
  options: StrykerOptions;
  workingDirectory: string;
  requireName: string;
  requirePath: string;
  additionalInjectableValues: unknown;
}

export interface DisposeMessage {
  kind: WorkerMessageKind.Dispose;
}

export interface WorkResult {
  kind: ParentMessageKind.Result;
  correlationId: number;
  result: any;
}

export interface RejectionResult {
  kind: ParentMessageKind.Rejection;
  correlationId: number;
  error: string;
}

export interface CallMessage {
  correlationId: number;
  kind: WorkerMessageKind.Call;
  args: any[];
  methodName: string;
}
