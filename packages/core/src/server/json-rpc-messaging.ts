import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient } from 'json-rpc-2.0';

import { InstrumentParams, MutateParams, MutatePartialResult, ProgressParams, ServerMethods } from './mutation-server-protocol.js';
import { runInstrumentation } from './methods/instrument-method.js';
import { runMutationTest, runMutationTestRealtime } from './methods/mutation-test-method.js';
import { Transporter } from './transport/transporter.js';

/**
 * Handles Mutation Server Protocol JSON-RPC messaging for the given transporter.
 */
export function setupJsonRpcMessaging(transporter: Transporter): void {
  const jsonRpcServer = new JSONRPCServer();
  const jsonRpcClient = new JSONRPCClient((message) => transporter.send(JSON.stringify(message)));
  const serverAndClient = new JSONRPCServerAndClient(jsonRpcServer, jsonRpcClient);

  const serverMethods: ServerMethods = {
    instrument: async (params: InstrumentParams) => runInstrumentation(params.globPatterns),
    mutate: async (params: MutateParams) => {
      if (params.partialResultToken) {
        await runMutationTestRealtime(params.globPatterns, (result) => {
          const progressParams: ProgressParams<MutatePartialResult> = { token: params.partialResultToken!, value: { mutants: [result] } };
          serverAndClient.notify('progress', progressParams);
        });

        return []; // All results are streamed as per protocol.
      }

      return runMutationTest(params.globPatterns);
    },
  };

  for (const key in serverMethods) {
    const k = key as keyof typeof serverMethods;
    serverAndClient.addMethod(k, serverMethods[k]);
  }

  transporter.onMessage(async (message: string) => {
    await serverAndClient.receiveAndSend(JSON.parse(message));
  });

  transporter.onClose(() => {
    serverAndClient.rejectAllPendingRequests('Connection is closed.');
  });

  transporter.onError((error: Error) => {
    console.error('Error occurred in transporter:', error);
  });
}
