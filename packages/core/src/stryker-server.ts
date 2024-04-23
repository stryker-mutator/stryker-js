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
import { MutantResult, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { Command } from 'commander';

import { from, fromEvent, fromEventPattern } from 'rxjs';

import { provideLogger } from './di/provide-logger.js';
import { PrepareExecutor } from './process/1-prepare-executor.js';
import { MutantInstrumenterExecutor as ServerMutantInstrumenterExecutor } from './server/mutant-instrument-executor.js';
import { MutantInstrumenterExecutor } from './process/2-mutant-instrumenter-executor.js';
import { Stryker } from './stryker.js';
import { BroadcastReporter } from './reporters/index.js';
import {
  ClientMethods,
  InstrumentParams,
  MutateParams,
  MutatePartialResult,
  ProgressParams,
  ProgressToken,
  ServerMethods,
} from './server/mutation-server-protocol.js';
import { DryRunExecutor } from './process/3-dry-run-executor.js';
import { MutationTestExecutor } from './process/4-mutation-test-executor.js';
import { coreTokens } from './di/index.js';
import { ConfigError, retrieveCause } from './errors.js';
import { LogConfigurator } from './logging/log-configurator.js';

export class StrykerServer {
  private readonly jsonRpcServer: TypedJSONRPCServer<ServerMethods>;
  private jsonRpcClient: TypedJSONRPCClient<ClientMethods> | undefined;
  private readonly webSocketServer: WebSocketServer;
  private isConnected = false; // Flag to track connection status
  private serverAndClient: TypedJSONRPCServerAndClient<ServerMethods, ClientMethods> | undefined;

  constructor(
    private readonly argv: string[],
    private readonly injectorFactory = createInjector,
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
        instrument: async (params: InstrumentParams) => await this.instrument(params),
        mutate: async (params: MutateParams) => await this.mutate(params),
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

  private async instrument(params: InstrumentParams): Promise<MutantResult[]> {
    const rootInjector = this.injectorFactory();

    const loggerProvider = provideLogger(rootInjector);

    const prepareExecutor = loggerProvider.injectClass(PrepareExecutor);

    const options = params.globPatterns?.length ? { mutate: params.globPatterns } : {};
    const mutantInstrumenterInjector = await prepareExecutor.execute(options);

    const mutantInstrumenter = mutantInstrumenterInjector.injectClass(ServerMutantInstrumenterExecutor);

    return await mutantInstrumenter.execute();
  }

  private async mutate(params: MutateParams): Promise<MutantResult[]> {
    if (!params.partialResultToken) {
      // No partial results requested, just run the mutation test
      return await new Stryker({ mutate: params.globPatterns }).runMutationTest();
    }

    const options: PartialStrykerOptions = params.globPatterns?.length ? { mutate: params.globPatterns } : {};
    options.reporters = ['empty']; // used to stream results

    const rootInjector = this.injectorFactory();
    const loggerProvider = provideLogger(rootInjector);

    try {
      // 1. Prepare. Load Stryker configuration, load the input files and starts the logging server
      const prepareExecutor = loggerProvider.injectClass(PrepareExecutor);

      const mutantInstrumenterInjector = await prepareExecutor.execute(options);

      const broadcastReporter = mutantInstrumenterInjector.resolve(coreTokens.reporter) as BroadcastReporter;
      const emptyReporter = broadcastReporter.reporters.empty;
      if (!emptyReporter) {
        throw new Error('Reporter unavailable');
      }

      const token: ProgressToken = params.partialResultToken;
      emptyReporter.onMutantTested = (result) => {
        const progressParams: ProgressParams<MutatePartialResult> = { token: token, value: { mutants: [result] } };
        this.serverAndClient!.notify('progress', progressParams);
      };

      try {
        // 2. Mutate and instrument the files and write to the sandbox.
        const mutantInstrumenter = mutantInstrumenterInjector.injectClass(MutantInstrumenterExecutor);
        const dryRunExecutorInjector = await mutantInstrumenter.execute();

        // 3. Perform a 'dry run' (initial test run). Runs the tests without active mutants and collects coverage.
        const dryRunExecutor = dryRunExecutorInjector.injectClass(DryRunExecutor);
        const mutationRunExecutorInjector = await dryRunExecutor.execute();

        // 4. Actual mutation testing. Will check every mutant and if valid run it in an available test runner.
        const mutationRunExecutor = mutationRunExecutorInjector.injectClass(MutationTestExecutor);

        await mutationRunExecutor.execute();

        return []; // All results are streamed as partial result notifications
      } catch (error) {
        if (mutantInstrumenterInjector.resolve(commonTokens.options).cleanTempDir !== 'always') {
          const log = loggerProvider.resolve(commonTokens.getLogger)(Stryker.name);
          log.debug('Not removing the temp dir because an error occurred');
          mutantInstrumenterInjector.resolve(coreTokens.temporaryDirectory).removeDuringDisposal = false;
        }
        throw error;
      }
    } catch (error) {
      const log = loggerProvider.resolve(commonTokens.getLogger)(Stryker.name);
      const cause = retrieveCause(error);
      if (cause instanceof ConfigError) {
        log.error(cause.message);
      } else {
        log.error('Unexpected error occurred while running Stryker', error);
        log.info('This might be a known problem with a solution documented in our troubleshooting guide.');
        log.info('You can find it at https://stryker-mutator.io/docs/stryker-js/troubleshooting/');
        if (!log.isTraceEnabled()) {
          log.info(
            'Still having trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.',
          );
        }
      }
      throw cause;
    } finally {
      await rootInjector.dispose();
      await LogConfigurator.shutdown();
    }
  }
}
