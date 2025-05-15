import { FileDescriptions, StrykerOptions } from '@stryker-mutator/api/core';

import type { LoggingServerAddress } from '../logging/index.js';

export enum WorkerMessageKind {
  Init,
  Call,
  Dispose,
}

export enum ParentMessageKind {
  /**
   * Indicates that the child process is spawned and ready to receive messages
   */
  Ready,
  /**
   * Indicates that initialization is done
   */
  Initialized,
  /**
   * Indicates an error happened during initialization
   */
  InitError,
  /**
   * Indicates that a 'Call' was successful
   */
  CallResult,
  /**
   * Indicates that a 'Call' was rejected
   */
  CallRejection,
  /**
   * Indicates that a 'Dispose' was completed
   */
  DisposeCompleted,
}

export type WorkerMessage = CallMessage | DisposeMessage | InitMessage;
export type ParentMessage =
  | InitRejectionResult
  | RejectionResult
  | WorkResult
  | {
      kind:
        | ParentMessageKind.DisposeCompleted
        | ParentMessageKind.Initialized
        | ParentMessageKind.Ready;
    };

export interface InitMessage {
  kind: WorkerMessageKind.Init;
  loggingServerAddress: LoggingServerAddress;
  options: StrykerOptions;
  fileDescriptions: FileDescriptions;
  pluginModulePaths: readonly string[];
  workingDirectory: string;
  namedExport: string;
  modulePath: string;
}

export interface DisposeMessage {
  kind: WorkerMessageKind.Dispose;
}

export interface WorkResult {
  kind: ParentMessageKind.CallResult;
  correlationId: number;
  result: any;
}

export interface RejectionResult {
  kind: ParentMessageKind.CallRejection;
  correlationId: number;
  error: string;
}

export interface InitRejectionResult {
  kind: ParentMessageKind.InitError;
  error: string;
}

export interface CallMessage {
  correlationId: number;
  kind: WorkerMessageKind.Call;
  args: any[];
  methodName: string;
}
