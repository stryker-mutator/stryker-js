import { WebSocketServer, WebSocket } from 'ws';
import { JSONRPCRequest, JSONRPCServer, TypedJSONRPCServer } from 'json-rpc-2.0';
import { MutationTestResult } from 'mutation-testing-report-schema';

import { StrykerInstrumenter } from './server/stryker-instrumenter.js';

// TODO: extract RPC methods to a separate package for reuse?

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Methods = {
  instrument(params: { globPatterns?: string[] }): MutationTestResult;
};

export class StrykerServer {
  private readonly jsonRpcServer: TypedJSONRPCServer<Methods>;
  private readonly webSocketServer: WebSocketServer;

  constructor() {
    this.webSocketServer = new WebSocketServer({ port: 8080 });

    this.jsonRpcServer = new JSONRPCServer();

    this.jsonRpcServer.addMethod('instrument', async (params: { globPatterns?: string[] }) => {
      const instrumenter = new StrykerInstrumenter({ mutate: params.globPatterns });
      return await instrumenter.runInstrumentation();
    });

    this.webSocketServer.on('connection', (ws: WebSocket) => {
      ws.on('message', async (message: string) => {
        let request: JSONRPCRequest | undefined;

        try {
          request = JSON.parse(message);
        } catch {}

        if (request) {
          const response = await this.jsonRpcServer.receive(request);
          if (response) {
            ws.send(JSON.stringify(response));
          }
        }
      });

      ws.on('close', () => {
        console.log('Connection closed.');
      });

      ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
      });
    });

    console.log('Server started');
  }
}
