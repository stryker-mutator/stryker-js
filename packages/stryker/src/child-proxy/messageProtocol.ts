import LoggingClientContext from '../logging/LoggingClientContext';

export enum WorkerMessageKind {
  'Init',
  'Call',
  'Dispose'
}

export enum ParentMessageKind {
  'Initialized',
  'Result',
  'Rejection',
  'DisposeCompleted'
}

export type WorkerMessage = InitMessage | CallMessage | DisposeMessage;
export type ParentMessage = WorkResult | { kind: ParentMessageKind.Initialized | ParentMessageKind.DisposeCompleted } | RejectionResult;

// Make this an unlikely command line argument
// (prevents incidental start of child process)
export const autoStart = 'childProcessAutoStart12937129s7d';

export interface InitMessage {
  constructorArgs: any[];
  kind: WorkerMessageKind.Init;
  loggingContext: LoggingClientContext;
  plugins: string[];
  requirePath: string;
  workingDirectory: string;
}

export interface DisposeMessage { kind: WorkerMessageKind.Dispose; }

export interface WorkResult {
  correlationId: number;
  kind: ParentMessageKind.Result;
  result: any;
}

export interface RejectionResult {
  correlationId: number;
  error: string;
  kind: ParentMessageKind.Rejection;
}

export interface CallMessage {
  args: any[];
  correlationId: number;
  kind: WorkerMessageKind.Call;
  methodName: string;
}
