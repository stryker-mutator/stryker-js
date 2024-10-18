import { expect } from 'chai';
import sinon from 'sinon';
import WebSocket from 'ws';

import { WebSocketTransporter } from '../../../../src/server/transport/index.js';

describe(WebSocketTransporter.name, () => {
  let transporter: WebSocketTransporter;
  let clock: sinon.SinonFakeTimers;
  let port: number;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  beforeEach(async () => {
    const logSpy = sinon.spy(console, 'log');
    transporter = new WebSocketTransporter(0);
    await clock.tickAsync(1); // Wait for event loop to finish before asserting
    const [_, webSocketPort] = logSpy.firstCall.args;
    port = webSocketPort;
    logSpy.restore();
  });

  afterEach(() => {
    clock.restore();
    transporter.close();
  });

  it('should log the port when the server is listening', async () => {
    const webSocketTransporter = new WebSocketTransporter(0);

    const logSpy = sinon.spy(console, 'log');

    // Wait for event loop to finish before asserting
    await clock.tickAsync(1);

    expect(logSpy).calledOnce;
    expect(logSpy.calledWith('Server is listening on port:', sinon.match.number)).to.be.true;
    webSocketTransporter.close();
  });

  it('should emit connected event when a client connects', async () => {
    // Arrange
    // create spy for transporter message event
    const connectedSpy = sinon.spy();
    sinon.replace(transporter, 'emit', connectedSpy);

    const ws = await getWebSocketConnection();

    // Act
    const message = 'Hello, world!';
    ws.send(message);

    // wait for message to be sent over WebSocket
    await new Promise((resolve) => setTimeout(resolve, 30));

    // Assert
    expect(connectedSpy).calledOnceWithExactly('message', message);
    ws.close();
  });

  it('should send message to connected client', async () => {
    // Arrange
    const ws = await getWebSocketConnection();

    // Act
    const message = 'Hello, world!';
    transporter.send(message);

    // Assert
    await new Promise<void>((resolve) =>
      ws.on('message', (data) => {
        expect(data.toString()).to.equal(message);
        resolve();
      }),
    );

    ws.close();
  });

  it('should not allow multiple connections at the same time', async () => {
    // Arrange
    const ws1 = await getWebSocketConnection();

    // Act
    const ws2 = new WebSocket(`ws://localhost:${port}`);
    await new Promise<void>((resolve) => ws2.on('close', resolve));

    // Assert
    expect(ws2.readyState).to.equal(WebSocket.CLOSED);
    ws1.close();
  });

  it('should allow new connections after the first one is closed', async () => {
    // Arrange
    const ws1 = await getWebSocketConnection();
    ws1.close();
    await new Promise<void>((resolve) => ws1.on('close', resolve));

    // Act
    const ws2 = await getWebSocketConnection();

    // Assert
    expect(ws2.readyState).to.equal(WebSocket.OPEN);
    ws2.close();
  });

  it('should use random port if not provided', async () => {
    const logSpy = sinon.spy(console, 'log');

    // Arrange
    const webSocketTransporter = new WebSocketTransporter();

    // Act
    await clock.tickAsync(1);

    // Assert
    expect(logSpy).calledOnce;
    expect(logSpy.firstCall.args[1] !== 0).to.be.true;
    expect(logSpy.calledWith('Server is listening on port:', sinon.match.number)).to.be.true;
    webSocketTransporter.close();
  });

  async function getWebSocketConnection(): Promise<WebSocket> {
    const ws = new WebSocket(`ws://localhost:${port}`);
    await new Promise<void>((resolve) => ws.on('open', resolve));
    return ws;
  }
});
