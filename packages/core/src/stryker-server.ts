import { WebSocketServer, WebSocket } from 'ws';
import {
  JSONRPCClient,
  JSONRPCServer,
  TypedJSONRPCServerAndClient,
  JSONRPCServerAndClient,
  TypedJSONRPCClient,
  TypedJSONRPCServer,
} from 'json-rpc-2.0';
import { createInjector } from 'typed-inject';
import { MutantResult } from '@stryker-mutator/api/core';
import { Command } from 'commander';

import {
  ClientMethods,
  InstrumentParams,
  MutateParams,
  MutatePartialResult,
  ProgressParams,
  ServerMethods,
} from './server/mutation-server-protocol.js';
import { runMutationTest, runMutationTestRealtime } from './server/methods/mutation-test-method.js';
import { instrument as runInstrumentation } from './server/methods/instrument-method.js';

export class StrykerServer {
  private readonly jsonRpcServer: TypedJSONRPCServer<ServerMethods>;
  private jsonRpcClient: TypedJSONRPCClient<ClientMethods> | undefined;
  private readonly webSocketServer: WebSocketServer;
  private isConnected = false; // Flag to track connection status
  private serverAndClient: TypedJSONRPCServerAndClient<ServerMethods, ClientMethods> | undefined;

  constructor(
    private readonly argv: string[],
    private readonly program: Command = new Command(),
  ) {
    this.program.option('-p, --port <port>', 'Start the Stryker server').showSuggestionAfterError().parse(this.argv);

    const options = this.program.opts();

    this.webSocketServer = new WebSocketServer({ port: options.port ?? 8080 });

    this.jsonRpcServer = new JSONRPCServer();

    this.webSocketServer.on('connection', (ws: WebSocket) => {
      if (this.isConnected) {
        ws.close(4000, 'Only one connection allowed');
        return;
      }

      this.isConnected = true;

      this.jsonRpcClient = new JSONRPCClient((message) => ws.send(JSON.stringify(message)));

      this.serverAndClient = new JSONRPCServerAndClient(this.jsonRpcServer, this.jsonRpcClient);

      const clientMethods: ClientMethods = {};
      const serverMethods: ServerMethods = {
        instrument: (params: InstrumentParams) => runInstrumentation(params.globPatterns),
        mutate: this.runMutationTest.bind(this),
      };

      const allMethods = { ...clientMethods, ...serverMethods };

      for (const key in allMethods) {
        const k = key as keyof typeof allMethods;
        this.serverAndClient.addMethod(k, allMethods[k]);
      }

      ws.on('message', async (message: string) => {
        await this.serverAndClient!.receiveAndSend(JSON.parse(message));
      });

      ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
      });

      ws.on('close', () => {
        this.isConnected = false;

        this.serverAndClient!.rejectAllPendingRequests('Connection is closed.');
      });
    });

    // Message to confirm process is ready to setup the WebSocket connection
    console.log('Server started');
  }

  private async runMutationTest(params: MutateParams): Promise<MutantResult[]> {
    if (params.partialResultToken) {
      await runMutationTestRealtime(params.globPatterns, (result) => {
        const progressParams: ProgressParams<MutatePartialResult> = { token: params.partialResultToken!, value: { mutants: [result] } };
        this.serverAndClient!.notify('progress', progressParams);
      });
      return []; // All results are streamed as per protocol.
    }

    return await runMutationTest(params.globPatterns);
  }
}
