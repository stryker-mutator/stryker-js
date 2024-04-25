import WebSocket, { WebSocketServer } from 'ws';

import { Transporter } from './transporter.js';

/**
 * A transporter that uses WebSockets to send and receive messages
 */
export class WebSocketTransporter implements Transporter {
  private readonly webSocketServer: WebSocketServer;
  private isConnected = false;
  private onMessageCallback: ((message: string) => void) | null = null;
  private onCloseCallback: (() => void) | null = null;
  private onConnectedCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  constructor(port: number) {
    this.webSocketServer = new WebSocketServer({ port }, () => {
      console.log('Server started');
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

    this.onConnectedCallback?.();
  }

  private handleMessage(message: string): void {
    this.onMessageCallback?.(message);
  }

  private handleClose(): void {
    this.isConnected = false;
    this.onCloseCallback?.();
  }

  private handleError(error: Error): void {
    this.onErrorCallback?.(error);
  }

  public send(message: string): void {
    this.webSocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public onMessage(callback: (message: string) => void): void {
    this.onMessageCallback = callback;
  }

  public onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  public onConnected(callback: () => void): void {
    this.onConnectedCallback = callback;
  }

  public onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }
}
