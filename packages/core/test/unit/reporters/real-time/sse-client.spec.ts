import { IncomingMessage, ServerResponse } from 'http';

import sinon from 'sinon';

import { expect } from 'chai';

import { MutantResult, MutantStatus } from 'mutation-testing-report-schema/api';

import { SseClient } from '../../../../src/reporters/real-time/sse-client.js';

describe(SseClient.name, () => {
  let serverResponse: ServerResponse;
  let serverResponseMock: sinon.SinonStubbedInstance<ServerResponse>;
  let sutWithMock: SseClient;
  let sut: SseClient;

  beforeEach(() => {
    serverResponse = new ServerResponse(sinon.createStubInstance(IncomingMessage));
    serverResponseMock = sinon.createStubInstance(ServerResponse);
    sutWithMock = new SseClient(serverResponseMock);
    sut = new SseClient(serverResponse);
  });

  it('should create a finished event listener', () => {
    sinon.assert.calledOnce(serverResponseMock.on);
  });

  it('should emit writing-finished event', async () => {
    const spy = sinon.spy();

    sut.addListener('writing-finished', () => {
      spy('stryker was here!');
    });

    serverResponse.emit('finish');

    expect(spy).to.have.callCount(1);
  });

  it('should write the response correctly', () => {
    const event = 'finished';
    const data = null;

    sutWithMock.send(event, data);

    expect(serverResponseMock.write).to.have.been.calledTwice;

    const firstCall = serverResponseMock.write.getCall(0);
    expect(firstCall.args.length).to.eq(1);
    expect(firstCall.firstArg).to.eq('event: finished\n');

    const secondCall = serverResponseMock.write.getCall(1);
    expect(secondCall.args.length).to.eq(1);
    expect(secondCall.firstArg).to.eq('data: null\n\n');
  });

  it('should stringify objects in the payload', () => {
    const event = 'mutant-tested';
    const data: MutantResult = {
      id: '1',
      status: MutantStatus.Killed,
      location: { start: { line: 1, column: 2 }, end: { line: 1, column: 2 } },
      mutatorName: 'block statement',
    };

    sutWithMock.send(event, data);

    expect(serverResponseMock.write.getCall(0).firstArg).to.eq('event: mutant-tested\n');
    expect(serverResponseMock.write.getCall(1).firstArg).to.eq(
      'data: {"id":"1","status":"Killed","location":{"start":{"line":1,"column":2},"end":{"line":1,"column":2}},"mutatorName":"block statement"}\n\n'
    );
  });

  it('should destroy the response when closing', () => {
    sutWithMock.close();

    sinon.assert.calledOnce(serverResponseMock.destroy);
  });
});
