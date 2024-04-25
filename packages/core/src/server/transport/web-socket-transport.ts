import WebSocket, { WebSocketServer } from 'ws';

export class WebSocketTransport {
  private readonly webSocketServer: WebSocketServer;

  private isConnected = false;

  constructor(port: number, onConnection: (ws: WebSocket) => void) {
    this.webSocketServer = new WebSocketServer({ port }, () => {
      // Message to client to notify that connection can be established
      console.log('Server started');
    });

    this.webSocketServer.on('connection', (ws: WebSocket) => {
      if (this.isConnected) {
        ws.close(4000, 'Only one connection allowed');
        return;
      }

      this.isConnected = true;

      ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
      });

      onConnection(ws);
    });
  }
}
