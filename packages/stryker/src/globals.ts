/**
 * These are fake dom type definitions that rxjs depends on
 */
interface EventTarget { }
interface NodeList { }
interface HTMLCollection { }
interface XMLHttpRequest { }
interface Event { }
interface MessageEvent { }
interface CloseEvent { }
interface WebSocket { }
declare namespace NodeJS {
  type MessageListener = (message: any, sendHandle: any) => void;
  type UncaughtExceptionListener = (error: Error) => void;
  type UnhandledRejectionListener = (reason: any, promise: Promise<any>) => void;
  type RejectionHandledListener = (promise: Promise<any>) => void;
  export interface Process extends EventEmitter {
    addListener(event: 'uncaughtException', listener: UncaughtExceptionListener): this;
    addListener(event: 'unhandledRejection', listener: UnhandledRejectionListener): this;
    addListener(event: 'rejectionHandled', listener: RejectionHandledListener): this;
    emit(event: 'uncaughtException', error: Error): boolean;
    emit(event: 'unhandledRejection', reason: any, promise: Promise<any>): boolean;
    emit(event: 'rejectionHandled', promise: Promise<any>): boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: 'uncaughtException', listener: UncaughtExceptionListener): this;
    on(event: 'unhandledRejection', listener: UnhandledRejectionListener): this;
    on(event: 'rejectionHandled', listener: RejectionHandledListener): this;
  }
}
declare module 'fs' {
  export function createWriteStream(path: string, options?: string): WriteStream;
}
