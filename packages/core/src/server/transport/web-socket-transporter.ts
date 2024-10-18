import EventEmitter from 'events';

import WebSocket, { WebSocketServer } from 'ws';
import { tokens } from 'typed-inject';

import { serverTokens } from './../index.js';

import { Transporter, TransporterEvents } from './index.js';

/**
 * A transporter that uses WebSockets to send and receive messages
 */
export class WebSocketTransporter extends EventEmitter<TransporterEvents> implements Transporter {
  private readonly webSocketServer: WebSocketServer;
  private isConnected = false;
  public static readonly inject = tokens(serverTokens.port);

  /**
   * Create a new WebSocket server for sending and receiving messages
   * @param port The port to listen on. If not provided, a random available port will be used
   */
  constructor(port?: number) {
    super();
    this.webSocketServer = new WebSocketServer({ port: port ?? 0 }, () => {
      // Confirm to parent process that server is ready to accept connections on given port
      const address = this.webSocketServer.address() as WebSocket.AddressInfo;
      console.log('Server is listening on port:', address.port);
    });

    this.webSocketServer.on('connection', this.handleConnection.bind(this));

    this.on('close', () => (this.isConnected = false));
  }

  private handleConnection(ws: WebSocket): void {
    if (this.isConnected) {
      ws.close(4000, 'Only one connection allowed');
      return;
    }

    this.isConnected = true;

    ws.on('message', (data: WebSocket.RawData) => {
      this.emit('message', data.toString());
    });
    ws.on('close', () => this.emit('close'));
    ws.on('error', (error: Error) => this.emit('error', error));
  }

  public send(message: string): void {
    this.webSocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public close(): void {
    this.webSocketServer.close();
  }
}
