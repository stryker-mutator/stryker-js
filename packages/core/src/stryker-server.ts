import {
  DiscoverParams,
  DiscoverResult,
  ConfigureParams,
  ConfigureResult,
  MutationTestParams,
  MutationTestResult,
  DiscoveredFile,
  FileRange,
} from 'mutation-server-protocol';
import {
  JSONRPCClient,
  JSONRPCServer,
  JSONRPCServerAndClient,
} from 'json-rpc-2.0';
import net from 'net';
import { createInjector, Injector } from 'typed-inject';
import { PrepareExecutor } from './process/1-prepare-executor.js';
import { createInstrumenter } from '@stryker-mutator/instrumenter';
import { commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import { coreTokens } from './di/index.js';
import { objectUtils } from './utils/object-utils.js';
import { JsonRpcEventDeserializer } from './utils/json-rpc-event-deserializer.js';
import { Observable } from 'rxjs';
import { MutantResult, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';
import { Stryker } from './stryker.js';
import { promisify } from 'util';
import { normalizeReportFileName } from './reporters/mutation-test-report-helper.js';
import {
  provideLogging,
  provideLoggingBackend,
} from './logging/provide-logging.js';
import {
  LoggingBackend,
  LoggingServer,
  LoggingServerAddress,
} from './logging/index.js';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';

export const rpcMethods = Object.freeze({
  configure: 'configure',
  discover: 'discover',
  mutationTest: 'mutationTest',
  reportMutationTestProgressNotification: 'reportMutationTestProgress',
});

const STRYKER_SERVER_NOT_STARTED =
  "Stryker server isn't started yet, please call `start` first";
const STRYKER_SERVER_ALREADY_STARTED = 'Server already started';
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
   * Keep track of the logging backend provider, so we can share the logging server between calls.
   * New injectors for discover or mutation test tasks.
   */
  #loggingBackendProvider?: Injector<{
    getLogger: LoggerFactoryMethod;
    logger: Logger;
    loggingSink: LoggingBackend;
    loggingServer: LoggingServer;
    loggingServerAddress: LoggingServerAddress;
  }>;
  #rootInjector?: Injector;

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
  async start(): Promise<number> {
    if (this.#rootInjector) {
      throw new Error(STRYKER_SERVER_ALREADY_STARTED);
    }
    this.#rootInjector = this.injectorFactory();
    this.#loggingBackendProvider = provideLogging(
      await provideLoggingBackend(this.#rootInjector),
    );
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
                rpc.client.notify(
                  rpcMethods.reportMutationTestProgressNotification,
                  {
                    files: {
                      [normalizeReportFileName(fileName)]: {
                        mutants: [mutant],
                      },
                    },
                  } satisfies MutationTestResult,
                );
              },
              error: reject,
              complete: () => resolve({ files: {} }),
            });
          });
        });
        socket.on('data', (data) => {
          const events = deserializer.deserialize(data);
          for (const event of events) {
            // https://www.npmjs.com/package/json-rpc-2.0#error-handling
            // errors are already handled by JSON RPC, so we can ignore them here
            void rpc.receiveAndSend(event);
          }
        });
      });

      this.#server.listen(() => {
        resolve((this.#server!.address() as net.AddressInfo).port);
      });
    });
  }

  async stop(): Promise<void> {
    await this.#rootInjector?.dispose();
    if (this.#server) {
      await promisify(this.#server.close.bind(this.#server))();
    }
    this.#server = undefined;
    this.#loggingBackendProvider = undefined;
  }

  configure(configureParams: ConfigureParams): ConfigureResult {
    this.#configFilePath = configureParams.configFilePath;
    return { version: '1' };
  }

  async discover(discoverParams: DiscoverParams): Promise<DiscoverResult> {
    if (!this.#loggingBackendProvider) {
      throw new Error(STRYKER_SERVER_NOT_STARTED);
    }
    const discoverInjector = this.#loggingBackendProvider.provideValue(
      coreTokens.reporterOverride,
      undefined,
    );
    try {
      const prepareExecutor = discoverInjector.injectClass(PrepareExecutor);
      const inj = await prepareExecutor.execute({
        cliOptions: {
          ...this.cliOptions,
        },
        targetMutatePatterns: this.#filesToGlobPatterns(discoverParams.files),
      });

      const instrumenter = inj.injectFunction(createInstrumenter);
      const pluginCreator = inj.resolve(coreTokens.pluginCreator);
      const options = inj.resolve(commonTokens.options);
      const project = inj.resolve(coreTokens.project);
      const filesToMutate = await Promise.all(
        [...project.filesToMutate.values()].map((file) =>
          file.toInstrumenterFile(),
        ),
      );
      const ignorers = options.ignorers.map((name) =>
        pluginCreator.create(PluginKind.Ignore, name),
      );
      const instrumentResult = await instrumenter.instrument(filesToMutate, {
        ignorers,
        ...options.mutator,
      });
      const mutants = instrumentResult.mutants.map((mutant) => ({
        ...mutant,
        location: objectUtils.toSchemaLocation(mutant.location),
      }));
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
    } finally {
      await discoverInjector.dispose();
    }
  }

  public mutationTest(
    mutationTestParams: MutationTestParams,
  ): Observable<MutantResult> {
    return new Observable<MutantResult>((subscriber) => {
      if (!this.#loggingBackendProvider) {
        throw new Error(STRYKER_SERVER_NOT_STARTED);
      }
      const reporter: Reporter = {
        onMutantTested(mutant) {
          subscriber.next(mutant);
        },
      };

      Stryker.run(
        this.#loggingBackendProvider.provideValue(
          coreTokens.reporterOverride,
          reporter,
        ),
        {
          cliOptions: {
            ...this.cliOptions,
            allowConsoleColors: false,
            configFile: this.#configFilePath,
          },
          targetMutatePatterns: this.#filesToGlobPatterns(
            mutationTestParams.files,
          ),
        },
      )
        .then(() => subscriber.complete())
        .catch((error) => subscriber.error(error));
    });
  }

  #filesToGlobPatterns(files: FileRange[] | undefined): string[] | undefined {
    return files?.map(
      ({ path, range }) =>
        `${path.endsWith('/') ? `${path}**/*` : path}${range ? `:${posToMutationRange(range.start)}-${posToMutationRange(range.end)}` : ''}`,
    );
  }
}

function posToMutationRange(pos: NonNullable<FileRange['range']>['start']) {
  return `${pos.line}:${pos.column - 1}`; // MSP expects col-range to be exclusive, Stryker uses inclusive (https://github.com/stryker-mutator/editor-plugins/tree/main/packages/mutation-server-protocol#position-and-location-semantics)
}
