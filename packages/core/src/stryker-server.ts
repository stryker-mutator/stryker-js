import { WebSocketServer, WebSocket } from 'ws';
import { JSONRPCServer, TypedJSONRPCServer, createJSONRPCErrorResponse } from 'json-rpc-2.0';
import { createInjector } from 'typed-inject';
import { MutationTestResult } from 'mutation-testing-report-schema';
import { MutantResult } from '@stryker-mutator/api/core';
import { Command } from 'commander';

import { MutationServerMethods } from './server/mutation-server-methods.js';
import { provideLogger } from './di/provide-logger.js';
import { PrepareExecutor } from './process/1-prepare-executor.js';
import { MutantInstrumenterExecutor } from './server/mutant-instrument-executor.js';
import { Stryker } from './stryker.js';

export class StrykerServer {
  private readonly jsonRpcServer: TypedJSONRPCServer<MutationServerMethods>;
  private readonly webSocketServer: WebSocketServer;

  constructor(
    private readonly argv: string[],
    private readonly injectorFactory = createInjector,
    private readonly program: Command = new Command(),
  ) {
    this.program.option('-p, --port <port>', 'Start the Stryker server').showSuggestionAfterError().parse(this.argv);

    const options = this.program.opts();

    this.webSocketServer = new WebSocketServer({ port: options.port ?? 8080 });

    this.jsonRpcServer = new JSONRPCServer();

    this.jsonRpcServer.addMethod('instrument', async (params: { globPatterns?: string[] }) => this.instrument(params.globPatterns));
    this.jsonRpcServer.addMethod('mutate', async (params: { globPatterns?: string[] }) => this.mutate(params.globPatterns));

    this.webSocketServer.on('connection', (ws: WebSocket) => {
      ws.on('message', async (message: string) => {
        let response = await this.jsonRpcServer.receiveJSON(message);

        if (!response) {
          response = createJSONRPCErrorResponse(null, -32603, 'Internal JSON-RPC error');
        }

        ws.send(JSON.stringify(response));
      });

      ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
      });
    });

    // Message to confirm process is ready to setup the WebSocket connection
    console.log('Server started');
  }

  private async instrument(globPatterns?: string[]): Promise<MutationTestResult> {
    const rootInjector = this.injectorFactory();

    const loggerProvider = provideLogger(rootInjector);

    const prepareExecutor = loggerProvider.injectClass(PrepareExecutor);

    const options = globPatterns?.length ? { mutate: globPatterns } : {};
    const mutantInstrumenterInjector = await prepareExecutor.execute(options);

    const mutantInstrumenter = mutantInstrumenterInjector.injectClass(MutantInstrumenterExecutor);

    return await mutantInstrumenter.execute();
  }

  private async mutate(globPatterns?: string[]): Promise<MutantResult[]> {
    return await new Stryker({ mutate: globPatterns }).runMutationTest();
  }
}
