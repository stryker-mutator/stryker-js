import { MutantResult, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { JSONRPCRequest, JSONRPCServer, TypedJSONRPCServer } from 'json-rpc-2.0';

import { StrykerInstrumenter } from './server/stryker-instrumenter.js';
// import { MutationTestResult } from 'mutation-testing-report-schema';

// TODO: extract RPC methods to a separate package for reuse?

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Methods = {
  instrument(params: { globPatterns?: string[] }): MutantResult[];
};

export class StrykerServer {
  private readonly readStream = process.stdin;
  private readonly writeStream = process.stdout;

  private readonly jsonRpcServer: TypedJSONRPCServer<Methods>;

  constructor() {
    this.jsonRpcServer = new JSONRPCServer();

    this.jsonRpcServer.addMethod('instrument', async (params: { globPatterns?: string[] }) => {
      const cliOptions: PartialStrykerOptions = { mutate: params.globPatterns };

      const instrumenter = new StrykerInstrumenter(cliOptions);

      return await instrumenter.runInstrumentation();
    });

    // Listen for data from the client
    this.readStream.on('data', async (data) => {
      let request: JSONRPCRequest | undefined;

      try {
        request = JSON.parse(data.toString());
      } catch {}

      if (request) {
        const response = await this.jsonRpcServer.receive(request);
        if (response) {
          this.writeStream.write(JSON.stringify(response));
        }
      }
    });

    // Handle connection closure
    this.readStream.on('end', () => {
      console.log('Connection closed.');
      process.exit(0);
    });

    // Handle connection errors
    this.readStream.on('error', (err) => {
      console.error('Error:', err);
      process.exit(1);
    });
  }
}
