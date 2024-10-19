import { type MutationTestPartialResult, rpcMethods, type DiscoverResult, type MutationTestParams } from './dist/src/mtsp-schema.js';
import type { schema } from '@stryker-mutator/api/core';
import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient } from 'json-rpc-2.0';
import { JsonRpcEventDeserializer } from './dist/src/utils/json-rpc-event-deserializer.js';
import net from 'net';
import { Observable } from 'rxjs';

class Sender {
  #client: JSONRPCServerAndClient;

  constructor(socket: net.Socket) {
    const deserializer = new JsonRpcEventDeserializer();
    this.#client = new JSONRPCServerAndClient(
      new JSONRPCServer(),
      new JSONRPCClient((jsonRPCRequest) => {
        const content = Buffer.from(JSON.stringify(jsonRPCRequest));
        socket.write(`Content-Length: ${content.byteLength}\r\n\r\n`);
        socket.write(content);
      }),
    );
    socket.on('data', (data) => {
      for (const event of deserializer.deserialize(data)) {
        this.#client.receiveAndSend(event);
      }
    });
  }

  discover(): PromiseLike<DiscoverResult> {
    return this.#client.request('discover', {});
  }
  mutationTest(params: MutationTestParams): Observable<schema.MutantResult> {
    return new Observable((subscriber) => {
      this.#client.addMethod(rpcMethods.reportMutationTestProgressNotification, (result: MutationTestPartialResult) => {
        for (const mutant of result.mutants) {
          subscriber.next(mutant);
        }
      });
      this.#client.request('mutationTest', params).then(
        (result: MutationTestPartialResult) => {
          for (const mutant of result.mutants) {
            subscriber.next(mutant);
          }
          this.#client.removeMethod(rpcMethods.reportMutationTestProgressNotification);
          subscriber.complete();
        },
        (err) => subscriber.error(err),
      );
    });
  }
}

import childProcess, { ChildProcess } from 'child_process';

const { host, port, process } = await runServer();

const socket = new net.Socket();
console.log('start!');
socket.connect(port, host);
const sender = new Sender(socket);

socket.on('close', function () {
  console.log('Connection closed');
});
const result = await sender.discover();
console.log('Finished with', result.mutants.length, 'mutants');
sender.mutationTest({ globPatterns: ['src/utils/json-rpc-event-deserializer.ts'] }).subscribe({
  next: ({
    location: {
      start: { column, line },
    },
    replacement,
    status,
  }) => {
    console.log(`Mutant@${line}:${column} ${status} -> ${replacement}`);
  },
  complete: () => {
    console.log('Mutation test done');
    socket.end();
    process.kill();
  },
});

function runServer() {
  return new Promise<{ port: number; host: string; process: ChildProcess }>((res) => {
    const child = childProcess.spawn('node', ['bin/stryker', 'runServer']);
    child.stdout.on('data', async (data) => {
      console.log('stdout:', data.toString());
    });
    child.stdout.once('data', async (data) => {
      const { port, host } = JSON.parse(data.toString());
      return res({ port, host, process: child });
    });
  });
}
