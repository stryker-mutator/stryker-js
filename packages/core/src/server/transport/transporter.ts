/**
 * Interface for a transporter (e.g. WebSocket, HTTP, IPC, etc.)
 */
export interface Transporter {
  /**
   * Register a callback for when the transporter is connected
   * @param callback The callback to register
   */
  onConnected(callback: () => void): void;
  /**
   * Register a callback for when a message is received
   * @param callback The callback to register
   */
  onMessage(callback: (message: string) => void): void;
  /**
   * Register a callback for when the transporter is closed
   * @param callback The callback to register
   */
  onClose(callback: () => void): void;
  /**
   * Send a message over the transporter
   * @param message The message to send
   */
  send(message: string): void;
  /**
   * Register a callback for when an error occurs
   * @param callback The callback to register
   */
  onError(callback: (error: Error) => void): void;
}
