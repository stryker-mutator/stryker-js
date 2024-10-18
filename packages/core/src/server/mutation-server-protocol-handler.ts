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
import { MutantResult, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { tokens } from 'typed-inject';

import * as semver from 'semver';

import { MutationTestMethod, InstrumentMethod } from './methods/index.js';
import { Transporter } from './transport/index.js';
import * as serverTokens from './server-tokens.js';

import {
  CancelNotification,
  ClientMethods,
  InstrumentParams,
  MutationTestParams,
  MutationTestPartialResult,
  ProgressParams,
  ErrorCodes,
  ServerMethods,
  InitializeResult,
  InitializeParams,
} from './index.js';

/**
 * Handles Mutation Server Protocol JSON-RPC messaging using the given transporter.
 */
export class MutationServerProtocolHandler {
  public static readonly inject = tokens(serverTokens.transporter);
  public static readonly protocolVersion = '0.0.1-alpha.1';
  private readonly serverAndClient: TypedJSONRPCServerAndClient<ServerMethods, ClientMethods>;

  // Map of request id to cancellation callback.
  private readonly cancellableRequests = new Map<number | string, AbortController>();
  private readonly strykerOptionsOverwrite: PartialStrykerOptions = {};
  private initialized = false;

  constructor(private readonly transporter: Transporter) {
    const jsonRpcServer = new JSONRPCServer();
    const jsonRpcClient = new JSONRPCClient((message) => transporter.send(JSON.stringify(message)));
    this.serverAndClient = new JSONRPCServerAndClient(jsonRpcServer, jsonRpcClient);

    this.serverAndClient.applyServerMiddleware(this.serverInitializedMiddleware.bind(this), this.requestCancellationMiddleware.bind(this));
    this.setupServerMethods();
    this.setupTransporterCallbacks();
  }

  private async serverInitializedMiddleware(next: JSONRPCServerMiddlewareNext<void>, request: JSONRPCRequest, serverParams: void) {
    if (this.initialized && request.method === 'initialize') {
      // Server is already initialized, only allow initialize requests once.
      return createJSONRPCErrorResponse(
        request.id ?? null,
        ErrorCodes.InvalidRequest,
        'Server is already initialized, you can only request initialization once.',
      );
    } else if (!this.initialized && request.method !== 'initialize') {
      // Server is not initialized, only allow initialize requests.
      return createJSONRPCErrorResponse(
        request.id ?? null,
        ErrorCodes.ServerNotInitialized,
        'Server is not initialized, you must request initialization first.',
      );
    }

    return next(request, serverParams);
  }

  private async requestCancellationMiddleware(next: JSONRPCServerMiddlewareNext<void>, request: JSONRPCRequest, serverParams: void) {
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
    this.serverAndClient.addMethodAdvanced('mutationTest', this.runMutationTestServerMethod.bind(this));
    this.serverAndClient.addMethod('instrument', this.runInstrumentation.bind(this));
    this.serverAndClient.addMethod('initialize', this.initialize.bind(this));
  }

  private async initialize(params: InitializeParams): Promise<InitializeResult> {
    if (!semver.valid(params.clientInfo.version, { loose: false })) {
      throw new Error(`Invalid client version: ${params.clientInfo.version}`);
    }

    const serverRange = `^${MutationServerProtocolHandler.protocolVersion}`;
    if (!semver.satisfies(params.clientInfo.version, serverRange, { includePrerelease: true })) {
      throw new Error(`Client version ${params.clientInfo.version} is not supported. Please use a version ${serverRange}`);
    }

    this.strykerOptionsOverwrite.configFile = params.configUri;
    this.initialized = true;

    return {
      serverInfo: {
        version: MutationServerProtocolHandler.protocolVersion,
      },
      capabilities: {
        mutationTestProvider: {
          partialResults: true,
        },
        instrumentationProvider: {
          partialResults: false,
        },
      },
    };
  }

  private async runInstrumentation(params: InstrumentParams): Promise<MutantResult[]> {
    const options: PartialStrykerOptions = {
      ...this.strykerOptionsOverwrite,
      ...(params.globPatterns?.length && { mutate: params.globPatterns }),
    };

    return await InstrumentMethod.runInstrumentation(options);
  }

  private async runMutationTestServerMethod(jsonRPCRequest: JSONRPCRequest): Promise<JSONRPCResponse> {
    const params = jsonRPCRequest.params as MutationTestParams;

    if (!jsonRPCRequest.id) {
      throw new Error('Request id is required.');
    }

    const abortController = this.cancellableRequests.get(jsonRPCRequest.id);

    if (!abortController) {
      throw new Error('No cancellation token found for request');
    }

    const options: PartialStrykerOptions = {
      ...this.strykerOptionsOverwrite,
      ...(params.globPatterns?.length && { mutate: params.globPatterns }),
    };

    const { signal } = abortController;
    const { partialResultToken } = params;
    let mutantResults: MutantResult[] = [];

    try {
      if (partialResultToken) {
        await new MutationTestMethod().runMutationTestRealtime(options, signal, (result) => {
          const progressParams: ProgressParams<MutationTestPartialResult> = { token: partialResultToken, value: { mutants: [result] } };
          this.serverAndClient.notify('progress', progressParams);
        });
      } else {
        mutantResults = await MutationTestMethod.runMutationTest(signal, options);
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
