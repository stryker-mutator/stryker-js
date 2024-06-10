import EventEmitter from 'events';

/**
 * Events that can be emitted by a transporter
 */
export interface TransporterEvents {
  message: [string];
  close: [];
  error: [Error];
}

/**
 * Interface for a transporter (e.g. WebSocket, HTTP, IPC, etc.)
 */
export interface Transporter extends EventEmitter<TransporterEvents> {
  /**
   * Send a message over the transporter
   * @param message The message to send
   */
  send(message: string): void;
}
