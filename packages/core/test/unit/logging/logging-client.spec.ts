import net from 'net';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import { LoggingClient } from '../../../src/logging/logging-client.js';
import { coreTokens } from '../../../src/di/index.js';
import { LogLevel } from '@stryker-mutator/api/core';
import { LoggingServerAddress } from '../../../src/logging/index.js';
import { expect } from 'chai';
import { LoggingEvent } from '../../../src/logging/logging-event.js';

describe(LoggingClient.name, () => {
  let sut: LoggingClient;
  let loggingServerAddress: LoggingServerAddress;
  let createConnectionStub: sinon.SinonStub<[port: number, host: string, connectionListener: () => void]>;
  let socketMock: sinon.SinonStubbedInstance<net.Socket>;
  let consoleErrorStub: sinon.SinonStubbedMember<typeof console.error>;

  beforeEach(() => {
    loggingServerAddress = { port: 4200 };
    createConnectionStub = sinon.stub(net, 'createConnection') as any;
    socketMock = {
      writable: true,
      on: sinon.stub(),
      write: sinon.stub(),
    } as sinon.SinonStubbedInstance<net.Socket>;
    consoleErrorStub = sinon.stub(console, 'error');
    createConnectionStub.returns(socketMock);
    sut = testInjector.injector
      .provideValue(coreTokens.loggerActiveLevel, LogLevel.Information)
      .provideValue(coreTokens.loggingServerAddress, loggingServerAddress)
      .injectClass(LoggingClient);
  });

  describe(LoggingClient.prototype.openConnection.name, () => {
    it('should create a connection', async () => {
      createConnectionStub.callsArgOn(2, undefined);
      await sut.openConnection();
      sinon.assert.calledOnceWithExactly(createConnectionStub, loggingServerAddress.port, 'localhost', sinon.match.func);
    });
    it('should reject when an error occurs', async () => {
      const expectedError = new Error('foobar');
      socketMock.on.withArgs('error' as 'timeout').callsArgWith(1, expectedError);
      await expect(sut.openConnection()).rejectedWith(expectedError);
    });
    it('should log errors to console', async () => {
      const expectedError = new Error('expected error');
      socketMock.on.withArgs('error' as 'timeout').callsArgWith(1, expectedError);
      await expect(sut.openConnection()).rejected;
      sinon.assert.calledOnceWithExactly(consoleErrorStub, 'Error occurred in logging client', expectedError);
    });
  });

  describe(LoggingClient.prototype.log.name, () => {
    it('should throw when not connected', () => {
      expect(() => sut.log(LoggingEvent.create('cat', LogLevel.Information, []))).throws(
        "Cannot use the logging client before it is connected, please call 'LoggingClient.prototype.openConnection' first",
      );
    });

    it('should write the event to the socket', async () => {
      await connect();
      const event = LoggingEvent.create('category', LogLevel.Information, ['foo', 'bar']);
      sut.log(event);
      sinon.assert.calledOnceWithExactly(socketMock.write, `${JSON.stringify(event.serialize())}__STRYKER_CORE__`);
    });

    it('should not write the event to the socket when the level is not enabled', async () => {
      await connect();
      const event = LoggingEvent.create('category', LogLevel.Trace, ['foo', 'bar']);
      sut.log(event);
      sinon.assert.notCalled(socketMock.write);
    });

    it('should only write if the socket is writable', async () => {
      await connect();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (socketMock.writable as boolean) = false;
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['foo', 'bar']));
      sinon.assert.notCalled(socketMock.write);
    });

    async function connect() {
      createConnectionStub.callsArgOn(2, undefined);
      await sut.openConnection();
    }
  });

  describe(LoggingClient.prototype.isEnabled.name, () => {
    it('should return true when the level is enabled', () => {
      expect(sut.isEnabled(LogLevel.Information)).true;
    });

    it('should return false when the level is not enabled', () => {
      expect(sut.isEnabled(LogLevel.Debug)).false;
    });
  });
});
