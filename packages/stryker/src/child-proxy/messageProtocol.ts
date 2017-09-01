export enum WorkerMessageKind {
  'Init',
  'Work'
}

export type WorkerMessage = InitMessage | WorkMessage;
export type ParentMessage = WorkResult | 'init_done';

export const autoStart = 'childProcessAutoStart';

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