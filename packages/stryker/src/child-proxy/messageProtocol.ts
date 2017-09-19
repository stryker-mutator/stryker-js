export enum WorkerMessageKind {
  'Init',
  'Work'
}

export type WorkerMessage = InitMessage | WorkMessage;
export type ParentMessage = WorkResult | 'init_done';

// Make this an unlikely command line argument 
// (prevents incidental start of child process)
export const autoStart = 'childProcessAutoStart12937129s7d';

export interface InitMessage {
  kind: WorkerMessageKind.Init;
  logLevel: string;
  plugins: string[];
  requirePath: string;
  constructorArgs: any[];
}

export interface WorkResult {
  correlationId: number;
  result: any;
}

export interface WorkMessage {
  correlationId: number;
  kind: WorkerMessageKind.Work;
  args: any[];
  methodName: string;
}