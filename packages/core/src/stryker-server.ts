import { Command } from 'commander';

import { WebSocketTransporter } from './server/transport/web-socket-transporter.js';
import { MutationServerProtocolHandler } from './server/mutation-server-protocol-handler.js';

export class StrykerServer {
  constructor(
    private readonly argv: string[],
    private readonly program: Command = new Command(),
  ) {
    this.program.option('-p, --port <port>', 'Start the Stryker server').showSuggestionAfterError().parse(this.argv);
    const options = this.program.opts();

    const transporter = new WebSocketTransporter(options.port as number);
    new MutationServerProtocolHandler(transporter);
  }
}
