import { Command } from 'commander';
import { createInjector } from 'typed-inject';

import { WebSocketTransporter } from './server/transport/index.js';
import { MutationServerProtocolHandler, serverTokens } from './server/index.js';

export class StrykerServer {
  constructor(
    private readonly argv: string[],
    private readonly program: Command = new Command(),
    private readonly injectorFactory = createInjector,
  ) {
    const rootInjector = this.injectorFactory();

    this.program.option('-p, --port <port>', 'Start the Stryker server').showSuggestionAfterError().parse(this.argv);
    const options = this.program.opts();

    rootInjector
      .provideValue(serverTokens.port, options.port as number)
      .provideClass(serverTokens.transporter, WebSocketTransporter)
      .injectClass(MutationServerProtocolHandler);
  }
}
