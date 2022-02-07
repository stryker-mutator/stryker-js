import { StrykerOptions } from '@stryker-mutator/api/core';

import { LoggingClientContext } from '../logging/index.js';

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

export interface InitMessage {
  kind: WorkerMessageKind.Init;
  loggingContext: LoggingClientContext;
  options: StrykerOptions;
  pluginModulePaths: readonly string[];
  workingDirectory: string;
  namedExport: string;
  modulePath: string;
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
