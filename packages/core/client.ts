import type { DiscoverResult } from './src/mtsp-schema.js';
import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient } from 'json-rpc-2.0';
import net from 'net';

class Sender {
  #client: JSONRPCServerAndClient;
  #msgQueue: string[] = [];

  constructor(socket: net.Socket) {
    this.#client = new JSONRPCServerAndClient(
      new JSONRPCServer(),
      new JSONRPCClient((jsonRPCRequest) => {
        socket.write(`${JSON.stringify(jsonRPCRequest)}\n`);
      }),
    );
    socket.on('data', (data) => {
      this.#msgQueue.push(data.toString());
      try {
        const msg = JSON.parse(this.#msgQueue.join(''));
        this.#msgQueue = [];
        this.#client.receiveAndSend(msg);
      } catch (e) {
        console.log('caught', e);
      }
    });
  }

  discover(): PromiseLike<DiscoverResult> {
    return this.#client.request('discover', {});
  }
}

const socket = new net.Socket();
console.log('start!');
socket.connect(44269, 'localhost');
socket.setEncoding('utf-8');
const sender = new Sender(socket);

socket.on('close', function () {
  console.log('Connection closed');
});
const result = await sender.discover();
import fs from 'fs';
fs.writeFileSync('discover.json', JSON.stringify(result, null, 2));
console.log('Finished with', result.mutants.length, 'mutants');
