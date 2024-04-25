import { Command } from 'commander';

import { JsonRpcRequestHandler } from './server/json-rpc/json-rpc-request-handler.js';
import { WebSocketTransport } from './server/transport/web-socket-transport.js';

export class StrykerServer {
  constructor(
    private readonly argv: string[],
    private readonly program: Command = new Command(),
  ) {
    this.program.option('-p, --port <port>', 'Start the Stryker server').showSuggestionAfterError().parse(this.argv);

    const options = this.program.opts();

    new WebSocketTransport((options.port as number) ?? 8080, (ws) => {
      JsonRpcRequestHandler.handleWebSocketRequests(ws);
    });

    console.log('Server started');
  }
}
