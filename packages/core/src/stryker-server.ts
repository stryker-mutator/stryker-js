import {
  DiscoverParams,
  DiscoverResult,
  ConfigureParams,
  ConfigureResult,
  MutationTestParams,
  MutationTestPartialResult,
  rpcMethods,
} from './mtsp-schema.js';
import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient } from 'json-rpc-2.0';
import net from 'net';
import { createInjector } from 'typed-inject';
import { provideLogger } from './di/provide-logger.js';
import { PrepareExecutor } from './process/1-prepare-executor.js';
import { createInstrumenter } from '@stryker-mutator/instrumenter';
import { commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import { coreTokens } from './di/index.js';
import { objectUtils } from './utils/object-utils.js';
import { JsonRpcEventDeserializer } from './utils/json-rpc-event-deserializer.js';
import { Observable } from 'rxjs';
import { schema } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';
import { Stryker } from './stryker.js';

/**
 * An implementation of the mutation testing server protocol for StrykerJS.
 * - Methods: `initialize`, `discover`, `mutationTest`
 *
 * @see https://github.com/jaspervdveen/vscode-stryker/blob/main/docs/mutation-server-protocol.md
 */
export class StrykerServer {
  #server?: net.Server;
  #configFilePath?: string;

  constructor(private readonly injectorFactory = createInjector) {}

  start(): Promise<number> {
    return new Promise((resolve) => {
      this.#server = net.createServer((socket) => {
        const deserializer = new JsonRpcEventDeserializer();
        const rpc = new JSONRPCServerAndClient(
          new JSONRPCServer(),
          new JSONRPCClient((jsonRPCRequest) => {
            const content = Buffer.from(JSON.stringify(jsonRPCRequest));
            socket.write(`Content-Length: ${content.byteLength}\r\n\r\n`);
            socket.write(content);
          }),
        );

        rpc.addMethod(rpcMethods.discover, this.discover.bind(this));
        rpc.addMethod(rpcMethods.mutationTest, (params: MutationTestParams) => {
          return new Promise<MutationTestPartialResult>((resolve, reject) => {
            this.mutationTest(params).subscribe({
              next: (mutantResult) => {
                rpc.client.notify(rpcMethods.reportMutationTestProgressNotification, {
                  mutants: [mutantResult],
                } satisfies MutationTestPartialResult);
              },
              error: reject,
              complete: () => resolve({ mutants: [] }),
            });
          });
        });
        socket.on('data', (data) => {
          const events = deserializer.deserialize(data);
          for (const event of events) {
            rpc.receiveAndSend(event);
          }
        });
      });

      this.#server.listen(() => {
        resolve((this.#server!.address() as net.AddressInfo).port);
      });
    });
  }

  configure(configureParams: ConfigureParams): ConfigureResult {
    this.#configFilePath = configureParams.configFilePath;
    return { version: '1' };
  }

  async discover(discoverParams: DiscoverParams): Promise<DiscoverResult> {
    const rootInjector = this.injectorFactory();
    const loggerProvider = provideLogger(rootInjector).provideValue(coreTokens.reporterOverride, undefined);

    const prepareExecutor = loggerProvider.injectClass(PrepareExecutor);
    const inj = await prepareExecutor.execute({ mutate: discoverParams.globPatterns });

    const instrumenter = inj.injectFunction(createInstrumenter);
    const pluginCreator = inj.resolve(coreTokens.pluginCreator);
    const options = inj.resolve(commonTokens.options);
    const project = inj.resolve(coreTokens.project);
    const filesToMutate = await Promise.all([...project.filesToMutate.values()].map((file) => file.toInstrumenterFile()));
    const ignorers = options.ignorers.map((name) => pluginCreator.create(PluginKind.Ignore, name));
    const instrumentResult = await instrumenter.instrument(filesToMutate, { ignorers, ...options.mutator });
    return { mutants: instrumentResult.mutants.map((mutant) => ({ ...mutant, location: objectUtils.toSchemaLocation(mutant.location) })) };
  }

  public mutationTest(params: MutationTestParams): Observable<schema.MutantResult> {
    return new Observable<schema.MutantResult>((subscriber) => {
      const reporter: Reporter = {
        onMutantTested(mutant) {
          subscriber.next(mutant);
        },
      };
      const stryker = new Stryker(
        { allowConsoleColors: false, configFile: this.#configFilePath, mutate: params.globPatterns },
        this.injectorFactory,
        reporter,
      );
      stryker
        .runMutationTest()
        .then(() => subscriber.complete())
        .catch((error) => subscriber.error(error));
    });
  }
}
