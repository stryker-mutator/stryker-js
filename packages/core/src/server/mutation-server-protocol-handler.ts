import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient, TypedJSONRPCServerAndClient } from 'json-rpc-2.0';
import { MutantResult } from '@stryker-mutator/api/core';
import { tokens } from 'typed-inject';

import { runInstrumentation, MutationTestMethod } from './methods/index.js';
import { Transporter } from './transport/index.js';
import * as serverTokens from './server-tokens.js';

import { ClientMethods, InstrumentParams, MutateParams, MutatePartialResult, ProgressParams, ServerMethods } from './index.js';

export class MutationServerProtocolHandler {
  public static readonly inject = tokens(serverTokens.transporter);
  private readonly serverAndClient: TypedJSONRPCServerAndClient<ServerMethods, ClientMethods>;

  constructor(private readonly transporter: Transporter) {
    const jsonRpcServer = new JSONRPCServer();
    const jsonRpcClient = new JSONRPCClient((message) => transporter.send(JSON.stringify(message)));
    this.serverAndClient = new JSONRPCServerAndClient(jsonRpcServer, jsonRpcClient);

    this.setupServerMethods();
    this.setupTransporterCallbacks();
  }

  private setupServerMethods(): void {
    const serverMethods: ServerMethods = {
      instrument: async (params: InstrumentParams) => runInstrumentation(params.globPatterns),
      mutate: this.runMutationTest.bind(this),
    };

    for (const key in serverMethods) {
      const k = key as keyof typeof serverMethods;
      this.serverAndClient.addMethod(k, serverMethods[k]);
    }
  }

  private setupTransporterCallbacks(): void {
    this.transporter.on('message', async (message: string) => {
      await this.serverAndClient.receiveAndSend(JSON.parse(message));
    });

    this.transporter.on('close', () => {
      this.serverAndClient.rejectAllPendingRequests('Connection is closed.');
    });

    this.transporter.on('error', (error: Error) => {
      console.error('Error occurred in transporter:', error);
    });
  }

  private async runMutationTest(params: MutateParams): Promise<MutantResult[]> {
    if (params.partialResultToken) {
      await MutationTestMethod.runMutationTestRealtime(params.globPatterns, (result) => {
        const progressParams: ProgressParams<MutatePartialResult> = { token: params.partialResultToken!, value: { mutants: [result] } };
        this.serverAndClient.notify('progress', progressParams);
      });

      return []; // All results are streamed as per protocol.
    }

    return MutationTestMethod.runMutationTest(params.globPatterns);
  }
}
