import {
  DiscoverParams,
  DiscoverResult,
  ConfigureParams,
  ConfigureResult,
  MutationTestParams,
  MutationTestResult,
  DiscoveredMutant,
  DiscoveredFile,
} from 'mutation-server-protocol';
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
import { MutantResult, PartialStrykerOptions, schema } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';
import { Stryker } from './stryker.js';
import { promisify } from 'util';
import { normalizeReportFileName } from './reporters/mutation-test-report-helper.js';

export const rpcMethods = Object.freeze({
  configure: 'configure',
  discover: 'discover',
  mutationTest: 'mutationTest',
  reportMutationTestProgressNotification: 'reportMutationTestProgress',
});

/**
 * An implementation of the mutation testing server protocol for StrykerJS.
 * - Methods: `initialize`, `discover`, `mutationTest`
 *
 * @see https://github.com/stryker-mutator/editor-plugins/tree/main/packages/mutation-server-protocol#readme
 */
export class StrykerServer {
  #server?: net.Server;
  #configFilePath?: string;

  /**
   *
   * @param cliOptions The cli options.
   * @param injectorFactory The injector factory, for testing purposes only
   */
  constructor(
    private readonly cliOptions: PartialStrykerOptions = {},
    private readonly injectorFactory = createInjector,
  ) {}

  /**
   * Starts the server and listens for incoming connections.
   * @returns The port the server is listening on
   */
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

        rpc.addMethod(rpcMethods.configure, this.configure.bind(this));
        rpc.addMethod(rpcMethods.discover, this.discover.bind(this));
        rpc.addMethod(rpcMethods.mutationTest, (params: MutationTestParams) => {
          return new Promise<MutationTestResult>((resolve, reject) => {
            this.mutationTest(params).subscribe({
              next: (mutantResult) => {
                const { fileName, ...mutant } = mutantResult;
                rpc.client.notify(rpcMethods.reportMutationTestProgressNotification, {
                  files: {
                    [normalizeReportFileName(fileName)]: {
                      mutants: [mutant],
                    },
                  },
                } satisfies MutationTestResult);
              },
              error: reject,
              complete: () => resolve({ files: {} }),
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

  async stop(): Promise<void> {
    if (this.#server) {
      await promisify(this.#server?.close.bind(this.#server))();
    }
  }

  configure(configureParams: ConfigureParams): ConfigureResult {
    this.#configFilePath = configureParams.configFilePath;
    return { version: '1' };
  }

  async discover(discoverParams: DiscoverParams): Promise<DiscoverResult> {
    const rootInjector = this.injectorFactory();
    const loggerProvider = provideLogger(rootInjector).provideValue(coreTokens.reporterOverride, undefined);

    const prepareExecutor = loggerProvider.injectClass(PrepareExecutor);
    const inj = await prepareExecutor.execute({
      ...this.cliOptions,
      ...this.#overrideMutate(discoverParams.files),
    });

    const instrumenter = inj.injectFunction(createInstrumenter);
    const pluginCreator = inj.resolve(coreTokens.pluginCreator);
    const options = inj.resolve(commonTokens.options);
    const project = inj.resolve(coreTokens.project);
    const filesToMutate = await Promise.all([...project.filesToMutate.values()].map((file) => file.toInstrumenterFile()));
    const ignorers = options.ignorers.map((name) => pluginCreator.create(PluginKind.Ignore, name));
    const instrumentResult = await instrumenter.instrument(filesToMutate, { ignorers, ...options.mutator });
    const mutants = instrumentResult.mutants.map((mutant) => ({ ...mutant, location: objectUtils.toSchemaLocation(mutant.location) }));
    const mutantsByFile = mutants.reduce((acc, mutant) => {
      const { fileName, ...discoveredMutant } = mutant;
      const normalizedFileName = normalizeReportFileName(fileName);
      const file = acc.get(normalizedFileName) ?? { mutants: [] };
      file.mutants.push(discoveredMutant);
      acc.set(normalizedFileName, file);
      return acc;
    }, new Map<string, DiscoveredFile>());
    return {
      files: Object.fromEntries(mutantsByFile.entries()),
    };
  }

  public mutationTest(params: MutationTestParams): Observable<MutantResult> {
    return new Observable<MutantResult>((subscriber) => {
      const reporter: Reporter = {
        onMutantTested(mutant) {
          subscriber.next(mutant);
        },
      };
      const stryker = new Stryker(
        { ...this.cliOptions, allowConsoleColors: false, configFile: this.#configFilePath, ...this.#overrideMutate(params.files) },
        this.injectorFactory,
        reporter,
      );
      stryker
        .runMutationTest()
        .then(() => subscriber.complete())
        .catch((error) => subscriber.error(error));
    });
  }

  #filesToGlobPatterns(files: string[] | undefined): string[] | undefined {
    return files?.map((file) => (file.endsWith('/') ? `${file}**/*` : file));
  }
  #overrideMutate(files?: string[]) {
    return files ? { mutate: this.#filesToGlobPatterns(files) } : undefined;
  }
}
