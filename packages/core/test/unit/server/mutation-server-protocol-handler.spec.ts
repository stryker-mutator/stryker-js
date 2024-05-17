import { EventEmitter } from 'events';

import sinon from 'sinon';
import { JSONRPCServerAndClient, createJSONRPCNotification, createJSONRPCRequest, createJSONRPCSuccessResponse } from 'json-rpc-2.0';
import { expect } from 'chai';
import { factory } from '@stryker-mutator/test-helpers';
import { MutantResult } from '@stryker-mutator/api/core';

import { InstrumentParams, MutateParams, MutatePartialResult, MutationServerProtocolHandler, ProgressParams } from '../../../src/server/index.js';
import { Transporter, TransporterEvents } from '../../../src/server/transport/index.js';
import { MutationTestMethod, InstrumentMethod } from '../../../src/server/methods/index.js';

describe(MutationServerProtocolHandler.name, () => {
  let transporterMock: TransporterMock;
  let clock: sinon.SinonFakeTimers;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  beforeEach(() => {
    transporterMock = new TransporterMock();
    new MutationServerProtocolHandler(transporterMock);
  });

  after(() => {
    clock.restore();
  });

  it('should run mutation test on request via transporter', async () => {
    // Arrange
    const sendSpy = sinon.spy(transporterMock, 'send');
    const mutationTestResult: MutantResult[] = [];
    sinon.replace(MutationTestMethod, 'runMutationTest', sinon.fake.resolves(mutationTestResult));

    // Create a JSON-RPC request
    const mutateParams: MutateParams = {
      globPatterns: ['foo'],
    };
    const jsonRpcRequest = createJSONRPCRequest(1, 'mutate', mutateParams);
    const runMutationRequest = JSON.stringify(jsonRpcRequest);

    // Act
    transporterMock.emit('message', runMutationRequest);

    // Wait for event loop to finish before asserting
    await clock.tickAsync(1);

    // Assert
    const successResponse = createJSONRPCSuccessResponse(1, mutationTestResult);
    expect(sendSpy).calledOnceWith(JSON.stringify(successResponse));
  });

  it('should run instrumentation on request via transporter', async () => {
    // Arrange
    const sendSpy = sinon.spy(transporterMock, 'send');
    const instrumentResult: MutantResult[] = [];

    sinon.replace(InstrumentMethod, 'runInstrumentation', sinon.fake.resolves(instrumentResult));

    const instrumentParams: InstrumentParams = {
      globPatterns: ['foo'],
    };
    const jsonRpcRequest = createJSONRPCRequest(1, 'instrument', instrumentParams);
    const runInstrumentationRequest = JSON.stringify(jsonRpcRequest);

    // Act
    transporterMock.emit('message', runInstrumentationRequest);

    // Wait for event loop to finish before asserting
    await clock.tickAsync(1);

    // Assert
    const successResponse = createJSONRPCSuccessResponse(1, instrumentResult);
    expect(sendSpy).calledOnceWith(JSON.stringify(successResponse));
  });

  it('should report partial results when partialResultToken is provided in mutation test request', async () => {
    // Arrange
    const sendSpy = sinon.spy(transporterMock, 'send');
    const mutationTestResult: MutantResult = factory.mutantResult();
    sinon.replace(MutationTestMethod.prototype, 'runMutationTestRealtime', sinon.fake.yields(mutationTestResult));

    const partialResultToken = 'token';
    const requestId = 1;

    // Create a JSON-RPC request
    const mutateParams: MutateParams = {
      globPatterns: ['foo', 'bar', 'baz'],
      partialResultToken,
    };
    const jsonRpcRequest = createJSONRPCRequest(requestId, 'mutate', mutateParams);
    const runMutationRequest = JSON.stringify(jsonRpcRequest);

    // Act
    transporterMock.emit('message', runMutationRequest);

    // Wait for event loop to finish before asserting
    await clock.tickAsync(1);

    const progressNotificationParams: ProgressParams<MutatePartialResult> = {
      token: partialResultToken,
      value: { mutants: [mutationTestResult] },
    };
    const progressNotification = createJSONRPCNotification('progress', progressNotificationParams);

    // Assert
    expect(sendSpy).calledTwice;
    expect(sendSpy).calledWith(JSON.stringify(progressNotification));
    expect(sendSpy).calledWith(JSON.stringify(createJSONRPCSuccessResponse(requestId, [])));
  });

  it('should reject all pending requests when transporter is closed', async () => {
    // Arrange
    const rejectAllPendingRequestsSpy = sinon.spy(JSONRPCServerAndClient.prototype, 'rejectAllPendingRequests');

    // Act
    transporterMock.emit('close');

    // Assert
    expect(rejectAllPendingRequestsSpy).calledOnceWith('Connection is closed.');
  });

  it('should log on error in transporter', async () => {
    // Arrange
    const consoleErrorSpy = sinon.spy(console, 'error');

    // Act
    transporterMock.emit('error', new Error('Transporter error'));

    // Assert
    expect(consoleErrorSpy).calledOnceWith('Error occurred in transporter:', sinon.match.instanceOf(Error));
  });
});

class TransporterMock extends EventEmitter<TransporterEvents> implements Transporter {
  public send(message: string): void {
    // Empty for now
  }
}
