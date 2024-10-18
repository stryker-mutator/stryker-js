import { DiscoverParams, DiscoverResult } from './mtsp-schema.js';
import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient } from 'json-rpc-2.0';
import net from 'net';
import { createInjector } from 'typed-inject';
import { provideLogger } from './di/provide-logger.js';
import { PrepareExecutor } from './process/1-prepare-executor.js';
import { MutantInstrumenterExecutor } from './process/2-mutant-instrumenter-executor.js';
import { createInstrumenter } from '@stryker-mutator/instrumenter';
import { commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import { coreTokens } from './di/index.js';

/**
 * An implementation of the mutation testing server protocol for StrykerJS.
 * - Methods: `initialize`, `discover`, `mutationTest`
 *
 * @see https://github.com/jaspervdveen/vscode-stryker/blob/main/docs/mutation-server-protocol.md
 */
export class StrykerServer {
  #server?: net.Server;

  constructor(private readonly injectorFactory = createInjector) {}

  initialize(): Promise<number> {
    return new Promise((resolve) => {
      this.#server = net.createServer((socket) => {
        const rpc = new JSONRPCServerAndClient(
          new JSONRPCServer(),
          new JSONRPCClient((jsonRPCRequest) => {
            socket.write(JSON.stringify(jsonRPCRequest));
          }),
        );

        rpc.addMethod('discover', this.discover.bind(this));
        socket.on('data', (data) => {
          rpc.receiveAndSend(JSON.parse(data.toString()));
        });
      });

      this.#server.listen(() => {
        resolve((this.#server!.address() as net.AddressInfo).port);
      });
    });
  }

  async discover(discoverParams: DiscoverParams): Promise<DiscoverResult> {
    const rootInjector = this.injectorFactory();
    const loggerProvider = provideLogger(rootInjector);

    const prepareExecutor = loggerProvider.injectClass(PrepareExecutor);
    const inj = await prepareExecutor.execute({ mutate: discoverParams.globPatterns });

    const instrumenter = inj.injectFunction(createInstrumenter);
    const pluginCreator = inj.resolve(coreTokens.pluginCreator);
    const options = inj.resolve(commonTokens.options);
    const project = inj.resolve(coreTokens.project);
    const filesToMutate = await Promise.all([...project.filesToMutate.values()].map((file) => file.toInstrumenterFile()));
    const ignorers = options.ignorers.map((name) => pluginCreator.create(PluginKind.Ignore, name));
    const instrumentResult = await instrumenter.instrument(filesToMutate, { ignorers, ...options.mutator });
    return { mutants: instrumentResult.mutants };
  }
}
