import { MutantResult } from '@stryker-mutator/api/core';

export type ProgressToken = number | string;

export interface ProgressParams<T> {
  /**
   * The progress token provided by the client or server.
   */
  token: ProgressToken;
  /**
   * The progress data.
   */
  value: T;
}

export interface PartialResultParams {
  /**
   * An optional token that a server can use to report partial results (e.g.
   * streaming) to the client.
   */
  partialResultToken?: ProgressToken;
}

export interface InstrumentParams {
  /**
   * The glob patterns to instrument.
   */
  globPatterns?: string[];
}

export interface MutateParams extends PartialResultParams {
  /**
   * The glob patterns to mutate.
   */
  globPatterns?: string[];
}

export interface CancelParams {
  /**
   * The request id to cancel.
   */
  id: number | string;
}

export interface MutatePartialResult {
  /**
   * The mutant results.
   */
  mutants: MutantResult[];
}

export interface Notification<T> {
  /**
   * The method name.
   */
  method: string;
  /**
   * The method parameters.
   */
  params: T;
}

export interface CancelNotification extends Notification<CancelParams> {
  method: '$/cancelRequest';
}

export type CancelRequest = Notification<CancelParams>;

export const ErrorCodes = {
  // Defined by JSON-RPC
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,

  /**
   * The client has canceled a request and a server has detected
   * the cancel.
   */
  RequestCancelled: -32000,
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ServerMethods = {
  instrument(params: InstrumentParams): Promise<MutantResult[]>;
  mutate(params: MutateParams): Promise<MutantResult[]>;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ClientMethods = {
  // empty
};
