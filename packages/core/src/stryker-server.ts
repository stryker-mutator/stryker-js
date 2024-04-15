import { WebSocketServer, WebSocket } from 'ws';
import { JSONRPCRequest, JSONRPCServer, TypedJSONRPCServer, createJSONRPCErrorResponse } from 'json-rpc-2.0';

import { Injector, createInjector } from 'typed-inject';

import { commonTokens } from '@stryker-mutator/api/plugin';

import { MutationTestResult } from 'mutation-testing-report-schema';

import { StrykerOptions } from '@stryker-mutator/api/core';

import { Command } from 'commander';

import { MutationServerMethods } from './server/mutation-server-methods.js';

import { provideLogger } from './di/provide-logger.js';
import { PrepareExecutor } from './process/1-prepare-executor.js';
import { MutantInstrumenterContext } from './process/2-mutant-instrumenter-executor.js';
import { MutantInstrumenterExecutor } from './server/mutant-instrument-executor.js';
import { ProjectReader } from './fs/project-reader.js';
import { coreTokens } from './di/index.js';

export class StrykerServer {
  private readonly jsonRpcServer: TypedJSONRPCServer<MutationServerMethods>;
  private readonly webSocketServer: WebSocketServer;
  private mutantInstrumenterInjector: Injector<MutantInstrumenterContext> | undefined;
  private options: StrykerOptions | undefined;

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
    // Load instrumenter context once and reuse it partially for every subsequent run for performance reasons
    if (!this.mutantInstrumenterInjector) {
      this.mutantInstrumenterInjector = await this.provideInstrumenterContext();
      this.options = this.mutantInstrumenterInjector.resolve(commonTokens.options);
    }
    const options: StrykerOptions = { ...this.options! };

    if (globPatterns) {
      // Override the mutate property with the provided glob patterns
      options.mutate = globPatterns;
    }

    const updatedMutantInstrumenterInjector = this.mutantInstrumenterInjector.provideValue(commonTokens.options, options);

    // Reload project as files might have changed since the last run
    const project = await updatedMutantInstrumenterInjector.injectClass(ProjectReader).read();

    const mutantInstrumenter = updatedMutantInstrumenterInjector.provideValue(coreTokens.project, project).injectClass(MutantInstrumenterExecutor);

    return await mutantInstrumenter.execute();
  }

  private async provideInstrumenterContext() {
    const rootInjector = this.injectorFactory();
    const loggerProvider = provideLogger(rootInjector);

    const prepareExecutor = loggerProvider.injectClass(PrepareExecutor);
    return await prepareExecutor.execute({});
  }
}
