import * as net from 'node:net';

import { MutantResult, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { JSONRPCRequest, JSONRPCServer, TypedJSONRPCServer } from 'json-rpc-2.0';

import { StrykerInstrumenter } from './server/stryker-instrumenter.js';

// TODO: extract RPC methods to a separate package for reuse?

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Methods = {
  instrument(params: { globPatterns?: string[] }): MutantResult[];
};

export class StrykerServer {
  private readonly jsonRpcServer: TypedJSONRPCServer<Methods>;

  private readonly server: net.Server;

  constructor() {
    this.server = net.createServer(); // Create a TCP server

    this.jsonRpcServer = new JSONRPCServer();

    this.jsonRpcServer.addMethod('instrument', async (params: { globPatterns?: string[] }) => {
      const cliOptions: PartialStrykerOptions = { mutate: params.globPatterns };

      const instrumenter = new StrykerInstrumenter(cliOptions);

      return await instrumenter.runInstrumentation();
    });

    this.server.on('connection', (socket: net.Socket) => {
      socket.on('data', async (data) => {
        let request: JSONRPCRequest | undefined;

        try {
          request = JSON.parse(data.toString());
        } catch {}

        if (request) {
          const response = await this.jsonRpcServer.receive(request);
          if (response) {
            socket.write(JSON.stringify(response) + '\n');
          }
        }
      });

      socket.on('close', () => {
        console.log('Connection closed.');
      });

      socket.on('error', (err) => {
        console.error('Socket Error:', err);
      });
    });

    this.server.listen(8080, () => {
      console.log('Server listening on port 8080');
    });
  }
}
