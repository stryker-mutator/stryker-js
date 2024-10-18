import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient } from 'json-rpc-2.0';
import net from 'net';

class Sender {
  #client: JSONRPCServerAndClient;

  constructor(socket: net.Socket) {
    this.#client = new JSONRPCServerAndClient(
      new JSONRPCServer(),
      new JSONRPCClient((jsonRPCRequest) => {
        socket.write(JSON.stringify(jsonRPCRequest));
      }),
    );
    this.#client.addMethod('count', ({ count }) => console.log(`Received: ${count}`));
    socket.on('data', (data) => {
      this.#client.receiveAndSend(JSON.parse(data.toString()));
    });
  }

  discover(initial: number) {
    return this.#client.request('start-counting', { initial });
  }
}

const socket = new net.Socket();
console.log('start!');
socket.connect(42879, 'localhost');
socket.setEncoding('utf-8');
const sender = new Sender(socket);

socket.on('close', function () {
  console.log('Connection closed');
});
const result = await sender.discover({});
console.log('Finished with', result);
