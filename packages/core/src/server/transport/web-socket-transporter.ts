import WebSocket, { WebSocketServer } from 'ws';

import { Transporter } from './transporter.js';

/**
 * A transporter that uses WebSockets to send and receive messages
 */
export class WebSocketTransporter implements Transporter {
  private readonly webSocketServer: WebSocketServer;
  private isConnected = false;
  private readonly onMessageCallbacks: Array<(message: string) => void> = [];
  private readonly onCloseCallbacks: Array<() => void> = [];
  private readonly onConnectedCallbacks: Array<() => void> = [];
  private readonly onErrorCallbacks: Array<(error: Error) => void> = [];

  /**
   * Create a new WebSocket server for sending and receiving messages
   * @param port The port to listen on. If not provided, a random available port will be used
   */
  constructor(port?: number) {
    this.webSocketServer = new WebSocketServer({ port: port ?? 0 }, () => {
      const address = this.webSocketServer.address() as WebSocket.AddressInfo;
      console.log('Server is listening on port:', address.port);
    });

    this.webSocketServer.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(ws: WebSocket): void {
    if (this.isConnected) {
      ws.close(4000, 'Only one connection allowed');
      return;
    }

    this.isConnected = true;

    ws.on('message', this.handleMessage.bind(this));
    ws.on('close', this.handleClose.bind(this));
    ws.on('error', this.handleError.bind(this));

    this.onConnectedCallbacks.forEach((callback) => callback());
  }

  private handleMessage(message: string): void {
    this.onMessageCallbacks.forEach((callback) => callback(message));
  }

  private handleClose(): void {
    this.isConnected = false;
    this.onCloseCallbacks.forEach((callback) => callback());
  }

  private handleError(error: Error): void {
    this.onErrorCallbacks.forEach((callback) => callback(error));
  }

  public send(message: string): void {
    this.webSocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public onMessage(callback: (message: string) => void): void {
    this.onMessageCallbacks.push(callback);
  }

  public onClose(callback: () => void): void {
    this.onCloseCallbacks.push(callback);
  }

  public onConnected(callback: () => void): void {
    this.onConnectedCallbacks.push(callback);
  }

  public onError(callback: (error: Error) => void): void {
    this.onErrorCallbacks.push(callback);
  }
}
