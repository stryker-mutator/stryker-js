import {
  JSONRPCClient,
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCServer,
  JSONRPCServerAndClient,
  JSONRPCServerMiddlewareNext,
  TypedJSONRPCServerAndClient,
  createJSONRPCErrorResponse,
} from 'json-rpc-2.0';
import { MutantResult } from '@stryker-mutator/api/core';
import { tokens } from 'typed-inject';

import { MutationTestMethod, InstrumentMethod } from './methods/index.js';
import { Transporter } from './transport/index.js';
import * as serverTokens from './server-tokens.js';

import {
  CancelNotification,
  ClientMethods,
  InstrumentParams,
  MutateParams,
  MutatePartialResult,
  ProgressParams,
  ErrorCodes,
  ServerMethods,
} from './index.js';

/**
 * Handles Mutation Server Protocol JSON-RPC messaging using the given transporter.
 */
export class MutationServerProtocolHandler {
  public static readonly inject = tokens(serverTokens.transporter);
  private readonly serverAndClient: TypedJSONRPCServerAndClient<ServerMethods, ClientMethods>;

  // Map of request id to cancellation callback.
  private readonly cancellableRequests = new Map<number | string, AbortController>();

  constructor(private readonly transporter: Transporter) {
    const jsonRpcServer = new JSONRPCServer();
    const jsonRpcClient = new JSONRPCClient((message) => transporter.send(JSON.stringify(message)));
    this.serverAndClient = new JSONRPCServerAndClient(jsonRpcServer, jsonRpcClient);

    this.serverAndClient.applyServerMiddleware(this.handleRequestCancellation.bind(this));
    this.setupServerMethods();
    this.setupTransporterCallbacks();
  }

  private async handleRequestCancellation(next: JSONRPCServerMiddlewareNext<void>, request: JSONRPCRequest, serverParams: void) {
    if (request.id) {
      this.cancellableRequests.set(request.id, new AbortController());
    }

    const response = await next(request, serverParams);

    if (request.id) {
      this.cancellableRequests.delete(request.id);
    }

    return response;
  }

  private setupServerMethods(): void {
    this.serverAndClient.addMethodAdvanced('mutate', this.runMutationTestServerMethod.bind(this));
    this.serverAndClient.addMethod('instrument', async (params: InstrumentParams) => InstrumentMethod.runInstrumentation(params.globPatterns));
  }

  private async runMutationTestServerMethod(jsonRPCRequest: JSONRPCRequest): Promise<JSONRPCResponse> {
    const params = jsonRPCRequest.params as MutateParams;

    if (!jsonRPCRequest.id) {
      throw new Error('Request id is required.');
    }

    const abortController = this.cancellableRequests.get(jsonRPCRequest.id);

    if (!abortController) {
      throw new Error('No cancellation token found for request');
    }

    const { signal } = abortController;
    const { partialResultToken } = params;

    let mutantResults: MutantResult[] = [];

    try {
      if (partialResultToken) {
        await new MutationTestMethod().runMutationTestRealtime(params.globPatterns, signal, (result) => {
          const progressParams: ProgressParams<MutatePartialResult> = { token: partialResultToken, value: { mutants: [result] } };
          this.serverAndClient.notify('progress', progressParams);
        });
      } else {
        mutantResults = await MutationTestMethod.runMutationTest(signal, params.globPatterns);
      }
    } catch (error) {
      if (!signal.aborted) {
        throw error;
      }
    }

    if (signal.aborted) {
      return createJSONRPCErrorResponse(jsonRPCRequest.id, ErrorCodes.RequestCancelled, 'Cancellation requested by client');
    }

    return {
      jsonrpc: '2.0',
      id: jsonRPCRequest.id,
      result: mutantResults,
    };
  }

  private setupTransporterCallbacks(): void {
    this.transporter.on('message', async (message: string) => await this.handleMessage(message));

    this.transporter.on('close', () => {
      this.serverAndClient.rejectAllPendingRequests('Connection is closed.');
    });

    this.transporter.on('error', (error: Error) => {
      console.error('Error occurred in transporter:', error);
    });
  }

  private async handleMessage(message: string): Promise<void> {
    const response = await this.serverAndClient.server.receiveJSON(message);

    if (response) {
      await this.serverAndClient.client.send(response);
    } else {
      // No response means the message was a JSON-RPC notification.
      this.handleNotification(message);
    }
  }

  private handleNotification(notification: string): void {
    try {
      const cancelNotification: CancelNotification = JSON.parse(notification);
      try {
        this.handleCancellation(cancelNotification.params.id);
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error('Only cancelRequest notifications are supported');
    }
  }

  private handleCancellation(id: number | string): void {
    const abortController = this.cancellableRequests.get(id);

    if (abortController) {
      abortController.abort();
      return;
    }

    throw new Error(`No request with id ${id} to cancel`);
  }
}
