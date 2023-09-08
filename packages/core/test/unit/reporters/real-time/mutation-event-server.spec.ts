import { throws } from 'assert';

import { Server } from 'http';

import sinon from 'sinon';

import { expect } from 'chai';

import { MutantResult, MutantStatus } from 'mutation-testing-report-schema/api';

import { MutationEventServer } from '../../../../src/reporters/real-time/mutation-event-server.js';
import { SseServer } from '../../../../src/reporters/real-time/sse-server.js';
import { SseClient } from '../../../../src/reporters/real-time/sse-client.js';

describe(MutationEventServer.name, () => {
  let sseServerMock: sinon.SinonStubbedInstance<SseServer>;
  let sut: MutationEventServer;

  beforeEach(() => {
    sseServerMock = sinon.createStubInstance(SseServer);
    sut = new MutationEventServer(sseServerMock);
  });

  it('should register two events', () => {
    sinon.assert.calledTwice(sseServerMock.on);
  });

  it('should start the SseServer', () => {
    sut.start();

    sinon.assert.calledOnce(sseServerMock.start);
  });

  it('should not retrieve port if server has not started yet', () => {
    throws(() => sut.port, new Error('Server has not been started yet...'));
  });

  it('shold retrieve port when server has started', () => {
    Object.defineProperty(sseServerMock, 'port', {
      get: sinon.stub().returns(8080),
    });

    sut.start();

    expect(sut.port).to.eq(8080);
  });

  describe('when sending events', () => {
    let serverMock: sinon.SinonStubbedInstance<Server>;
    let sseClientMock: sinon.SinonStubbedInstance<SseClient>;
    let sseServer: SseServer;

    beforeEach(() => {
      serverMock = sinon.createStubInstance(Server);
      sseClientMock = sinon.createStubInstance(SseClient);
      sseServer = new SseServer(serverMock);
      sut = new MutationEventServer(sseServer);
    });

    it('should send mutant-tested event', () => {
      sseServer.emit('client-connected', sseClientMock);
      sseServer.emit('client-connected', sseClientMock);
      const data: MutantResult = {
        id: '1',
        status: MutantStatus.Killed,
        location: { start: { line: 1, column: 2 }, end: { line: 1, column: 2 } },
        mutatorName: 'block statement',
      };

      sut.sendMutantTested(data);

      sinon.assert.calledTwice(sseClientMock.send);
      const firstCall = sseClientMock.send.firstCall;
      expect(firstCall.firstArg).to.be.eq('mutant-tested');
      expect(firstCall.lastArg).to.deep.include({
        id: '1',
        status: MutantStatus.Killed,
        location: { start: { line: 1, column: 2 }, end: { line: 1, column: 2 } },
        mutatorName: 'block statement',
      });
    });

    it('should send finished multiple times', () => {
      sseServer.emit('client-connected', sseClientMock);
      sseServer.emit('client-connected', sseClientMock);

      sut.sendFinished();

      sinon.assert.calledTwice(sseClientMock.send);
      const firstCall = sseClientMock.send.firstCall;
      expect(firstCall.firstArg).to.be.eq('finished');
      expect(firstCall.lastArg).to.eql({});
    });
  });
});
