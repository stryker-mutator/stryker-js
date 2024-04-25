import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient } from 'json-rpc-2.0';
import { WebSocket } from 'ws';

import { ClientMethods, InstrumentParams, MutateParams, MutatePartialResult, ProgressParams, ServerMethods } from '../mutation-server-protocol.js';
import { runInstrumentation } from '../methods/instrument-method.js';
import { runMutationTest, runMutationTestRealtime } from '../methods/mutation-test-method.js';

export class JsonRpcRequestHandler {
  public static handleWebSocketRequests(ws: WebSocket): void {
    const jsonRpcServer = new JSONRPCServer();
    const jsonRpcClient = new JSONRPCClient((message) => ws.send(JSON.stringify(message)));
    const serverAndClient = new JSONRPCServerAndClient(jsonRpcServer, jsonRpcClient);

    const clientMethods: ClientMethods = {};
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

    const allMethods = { ...clientMethods, ...serverMethods };

    for (const key in allMethods) {
      const k = key as keyof typeof allMethods;
      serverAndClient.addMethod(k, allMethods[k]);
    }

    ws.on('message', async (message: string) => {
      await serverAndClient.receiveAndSend(JSON.parse(message));
    });

    ws.on('close', () => {
      serverAndClient.rejectAllPendingRequests('Connection is closed.');
    });
  }
}
