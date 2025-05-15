import net from 'net';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import {
  LoggingServer,
  LoggingServerAddress,
} from '../../../src/logging/logging-server.js';
import { LoggingSink } from '../../../src/logging/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { expect } from 'chai';
import { LoggingEvent } from '../../../src/logging/logging-event.js';
import { LogLevel } from '@stryker-mutator/api/core';

describe(LoggingServer.name, () => {
  let sut: LoggingServer;
  let loggingSinkMock: sinon.SinonStubbedInstance<LoggingSink>;
  let serverMock: sinon.SinonStubbedInstance<net.Server>;
  let createServerStub: sinon.SinonStubbedMember<typeof net.createServer>;

  beforeEach(() => {
    loggingSinkMock = {
      isEnabled: sinon.stub(),
      log: sinon.stub(),
    };
    serverMock = sinon.createStubInstance(net.Server);
    createServerStub = sinon.stub(net, 'createServer').returns(serverMock);
    sut = testInjector.injector
      .provideValue(coreTokens.loggingSink, loggingSinkMock)
      .injectClass(LoggingServer);
  });

  it('should return the port when listen is called', async () => {
    const port = 42;
    serverMock.address.returns({ port } as net.AddressInfo);
    serverMock.listen.callsArg(0);
    const actual = await sut.listen();
    expect(actual).deep.eq({ port } satisfies LoggingServerAddress);
  });

  it('should close the server when disposed', async () => {
    serverMock.close.callsArg(0);
    await sut.dispose();
    sinon.assert.called(serverMock.close);
  });

  it('should be able to receive a plain log event', () => {
    const client = connectClient();
    const logEvent = LoggingEvent.create('foo', LogLevel.Debug, ['bar']);
    const serializedLogEvent = JSON.stringify(logEvent.serialize());
    const [eventName, receiveCallback] = client.on.getCall(0).args;
    expect(eventName).eq('data');
    (receiveCallback as (data: string) => void)(
      `${serializedLogEvent}__STRYKER_CORE__`,
    );
    sinon.assert.calledWith(loggingSinkMock.log, logEvent);
  });

  it('should set encoding to utf-8', () => {
    const client = connectClient();
    expect(client.setEncoding).calledOnceWithExactly('utf-8');
  });

  it('should be able to receive a log event over multiple data calls', () => {
    const client = connectClient();
    const logEvent = LoggingEvent.create('foo', LogLevel.Debug, ['bar']);
    const serializedLogEvent = JSON.stringify(logEvent.serialize());
    const [eventName, receiveCallback] = client.on.getCall(0).args;
    expect(eventName).eq('data');
    const receive = receiveCallback as (data: string) => void;
    receive(serializedLogEvent.substring(0, 10));
    receive(serializedLogEvent.substring(10));
    sinon.assert.notCalled(loggingSinkMock.log);
    receive('__STRYKER');
    receive('_CORE__');
    sinon.assert.calledWith(loggingSinkMock.log, logEvent);
  });

  it('should be able to receive multiple log events in one data call', () => {
    const client = connectClient();
    const logEvent1 = LoggingEvent.create('foo', LogLevel.Debug, ['bar']);
    const logEvent2 = LoggingEvent.create('baz', LogLevel.Fatal, ['qux']);
    const serializedLogEvent1 = JSON.stringify(logEvent1.serialize());
    const serializedLogEvent2 = JSON.stringify(logEvent2.serialize());
    const [eventName, receiveCallback] = client.on.getCall(0).args;
    expect(eventName).eq('data');
    (receiveCallback as (data: string) => void)(
      `${serializedLogEvent1}__STRYKER_CORE__${serializedLogEvent2}__STRYKER_CORE__`,
    );
    sinon.assert.calledWith(loggingSinkMock.log, logEvent1);
    sinon.assert.calledWith(loggingSinkMock.log, logEvent2);
  });

  it('should log an error when a worker log process hangs up unexpectedly', () => {
    const client = connectClient();
    const error = new Error('foobar');
    const [eventName, errorCallback] = client.on.getCall(1).args;
    expect(eventName).eq('error');
    (errorCallback as (error: Error) => void)(error);

    const actualErrorLogEvent = loggingSinkMock.log.getCall(0).args[0];
    expect(actualErrorLogEvent.categoryName).eq(LoggingServer.name);
    expect(actualErrorLogEvent.level).eq(LogLevel.Debug);
    expect(actualErrorLogEvent.data[0]).eq(
      'An worker log process hung up unexpectedly',
    );
    expect(actualErrorLogEvent.data[1]).eq(error);
  });

  function connectClient() {
    const client = sinon.createStubInstance(net.Socket);
    createServerStub.callArgWith(0, client);
    return client;
  }
});
