import { IncomingMessage, Server, ServerResponse, createServer } from 'http';

import sinon from 'sinon';

import { expect } from 'chai';

import { SseServer } from '../../../../src/reporters/real-time/sse-server.js';

describe(SseServer.name, () => {
  let server: Server;
  let serverResponseMock: sinon.SinonStubbedInstance<ServerResponse>;
  let sut: SseServer;

  beforeEach(() => {
    server = createServer();
    serverResponseMock = sinon.createStubInstance(ServerResponse);
    sut = new SseServer(server);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create an "on" request listener', () => {
    const spy = sinon.stub(server, 'on');
    sut = new SseServer(server);
    expect(spy.calledOnce).to.be.true;
  });

  it('should set port', () => {
    const listenSpy = sinon.stub(server, 'listen');
    const addressSpy = sinon.stub(server, 'address').returns({ address: '', family: 'string', port: 8080 });

    sut.start();

    expect(listenSpy.calledOnce).to.be.true;
    expect(addressSpy.calledOnce).to.be.true;
    expect(sut.port).to.eq(8080);
  });

  it('should write the correct HTTP headers', () => {
    server.emit('request', null, serverResponseMock);

    expect(serverResponseMock.writeHead.calledOnce);
    const writeCall = serverResponseMock.writeHead.getCall(0);
    expect(writeCall.firstArg).to.eq(200);
    expect(writeCall.lastArg).to.include({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
  });

  it('should emit the client-connected event', () => {
    const spy = sinon.spy();
    sut.addListener('client-connected', () => {
      spy('Stryker was here!');
    });
    server.emit('request', null, serverResponseMock);

    expect(spy.calledOnce).to.be.true;
  });

  it('should emit the client-disconnected event', () => {
    const messageMock = sinon.createStubInstance(IncomingMessage);
    const serverResponse = new ServerResponse(messageMock);
    const spy = sinon.spy();
    sut.addListener('client-disconnected', () => {
      spy('stryker was here!');
    });
    server.emit('request', null, serverResponse);
    serverResponse.emit('close');

    expect(spy.calledOnce).to.be.true;
  });

  it('should close the clients', () => {
    server.emit('request', null, serverResponseMock);
    server.emit('request', null, serverResponseMock);

    sut.stop();

    expect(serverResponseMock.destroy.calledTwice).to.be.true;
  });

  it('should only close connected clients', () => {
    const messageMock = sinon.createStubInstance(IncomingMessage);
    const serverResponse = new ServerResponse(messageMock);
    const destroy = sinon.spy(serverResponse, 'destroy');

    server.emit('request', null, serverResponse);
    serverResponse.emit('close');
    server.emit('request', null, serverResponse);
    sut.stop();

    expect(destroy.calledOnce).to.be.true;
  });
});
