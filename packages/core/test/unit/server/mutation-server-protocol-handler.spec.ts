import { EventEmitter } from 'events';

import sinon from 'sinon';
import {
  JSONRPCServerAndClient,
  createJSONRPCErrorResponse,
  createJSONRPCNotification,
  createJSONRPCRequest,
  createJSONRPCSuccessResponse,
} from 'json-rpc-2.0';
import { config, expect } from 'chai';
import { factory } from '@stryker-mutator/test-helpers';
import { MutantResult, PartialStrykerOptions } from '@stryker-mutator/api/core';

import {
  ErrorCodes,
  InstrumentParams,
  MutateParams,
  MutatePartialResult,
  MutationServerProtocolHandler,
  ProgressParams,
} from '../../../src/server/index.js';
import { Transporter, TransporterEvents } from '../../../src/server/transport/index.js';
import { MutationTestMethod, InstrumentMethod } from '../../../src/server/methods/index.js';

describe(MutationServerProtocolHandler.name, () => {
  let transporterMock: TransporterMock;
  let clock: sinon.SinonFakeTimers;
  let sendSpy: sinon.SinonSpy;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  beforeEach(() => {
    transporterMock = new TransporterMock();
    new MutationServerProtocolHandler(transporterMock);
    sendSpy = sinon.spy(transporterMock, 'send');
  });

  after(() => {
    clock.restore();
  });

  it('should run mutation test on request via transporter', async () => {
    // Arrange
    const mutationTestResult: MutantResult[] = [];
    sinon.replace(MutationTestMethod, 'runMutationTest', sinon.fake.resolves(mutationTestResult));

    // Create a JSON-RPC request
    const mutateParams: MutateParams = {
      globPatterns: ['foo'],
    };
    const jsonRpcRequest = createJSONRPCRequest(1, 'mutate', mutateParams);
    const runMutationRequest = JSON.stringify(jsonRpcRequest);

    transporterMock.emit('message', JSON.stringify(createJSONRPCRequest(1, 'initialize', {})));

    // Act
    transporterMock.emit('message', runMutationRequest);

    // Wait for event loop to finish before asserting
    await clock.tickAsync(1);

    // Assert
    const successResponse = createJSONRPCSuccessResponse(1, mutationTestResult);
    expect(sendSpy).calledTwice;
    expect(sendSpy).calledWith(JSON.stringify(successResponse));
  });

  it('should run instrumentation on request via transporter', async () => {
    // Arrange
    const instrumentResult: MutantResult[] = [];

    sinon.replace(InstrumentMethod, 'runInstrumentation', sinon.fake.resolves(instrumentResult));

    const instrumentParams: InstrumentParams = {
      globPatterns: ['foo'],
    };
    const jsonRpcRequest = createJSONRPCRequest(1, 'instrument', instrumentParams);
    const runInstrumentationRequest = JSON.stringify(jsonRpcRequest);

    transporterMock.emit('message', JSON.stringify(createJSONRPCRequest(1, 'initialize', {})));

    // Act
    transporterMock.emit('message', runInstrumentationRequest);

    // Wait for event loop to finish before asserting
    await clock.tickAsync(1);

    // Assert
    const successResponse = createJSONRPCSuccessResponse(1, instrumentResult);
    expect(sendSpy).calledTwice;
    expect(sendSpy).calledWith(JSON.stringify(successResponse));
  });

  it('should report partial results when partialResultToken is provided in mutation test request', async () => {
    // Arrange
    const mutationTestResult: MutantResult = factory.mutantResult();
    sinon.replace(MutationTestMethod.prototype, 'runMutationTestRealtime', sinon.fake.yields(mutationTestResult));

    const partialResultToken = 'token';
    const requestId = 2;

    // Create a JSON-RPC request
    const mutateParams: MutateParams = {
      globPatterns: ['foo', 'bar', 'baz'],
      partialResultToken,
    };
    const jsonRpcRequest = createJSONRPCRequest(requestId, 'mutate', mutateParams);
    const runMutationRequest = JSON.stringify(jsonRpcRequest);

    transporterMock.emit('message', JSON.stringify(createJSONRPCRequest(1, 'initialize', {})));

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
    expect(sendSpy).calledThrice;
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

  it('should error if server is not initialized', async () => {
    // Arrange
    const randomRequest = JSON.stringify(createJSONRPCRequest(1, 'foo', {}));
    const errorResponse = createJSONRPCErrorResponse(
      1,
      ErrorCodes.ServerNotInitialized,
      'Server is not initialized, you must request initialization first.',
    );

    // Act
    transporterMock.emit('message', randomRequest);
    await clock.tickAsync(1);

    // Assert
    expect(sendSpy).calledOnceWith(JSON.stringify(errorResponse));
  });

  it('should error if server is initialized multiple times', async () => {
    // Arrange
    const errorResponse = createJSONRPCErrorResponse(
      2,
      ErrorCodes.InvalidRequest,
      'Server is already initialized, you can only request initialization once.',
    );

    // Act
    transporterMock.emit('message', JSON.stringify(createJSONRPCRequest(1, 'initialize', {})));
    await clock.tickAsync(1);
    transporterMock.emit('message', JSON.stringify(createJSONRPCRequest(2, 'initialize', {})));
    await clock.tickAsync(1);

    // Assert
    expect(sendSpy).calledTwice;
    expect(sendSpy).calledWith(JSON.stringify(errorResponse));
  });

  it('should use the stryker options from the initialize request in instrument run', async () => {
    // Arrange
    transporterMock.emit('message', JSON.stringify(createJSONRPCRequest(1, 'initialize', { configUri: 'foo' })));

    // Create a JSON-RPC request
    const instrumentParams: InstrumentParams = {
      globPatterns: ['bar'],
    };
    const jsonRpcRequest = createJSONRPCRequest(1, 'instrument', instrumentParams);
    const runMutationRequest = JSON.stringify(jsonRpcRequest);

    const fake = sinon.fake.resolves([]);

    sinon.replace(InstrumentMethod, 'runInstrumentation', fake);

    const expectedOptions: PartialStrykerOptions = {
      configFile: 'foo',
      mutate: ['bar'],
    };

    // Act
    transporterMock.emit('message', runMutationRequest);

    await clock.tickAsync(1);

    // Assert
    expect(sendSpy).calledTwice;
    expect(fake).calledWithExactly(expectedOptions);
  });

  it('should use the stryker options from the initialize request in mutation run', async () => {
    // Arrange
    transporterMock.emit('message', JSON.stringify(createJSONRPCRequest(1, 'initialize', { configUri: 'foo' })));

    // Create a JSON-RPC request
    const mutateParams: MutateParams = {
      globPatterns: ['bar'],
    };

    const jsonRpcRequest = createJSONRPCRequest(1, 'mutate', mutateParams);
    const runMutationRequest = JSON.stringify(jsonRpcRequest);

    const fake = sinon.fake.resolves([]);

    sinon.replace(MutationTestMethod, 'runMutationTest', fake);

    const expectedOptions: PartialStrykerOptions = {
      configFile: 'foo',
      mutate: ['bar'],
    };

    // Act
    transporterMock.emit('message', runMutationRequest);

    await clock.tickAsync(1);

    // Assert
    expect(sendSpy).calledTwice;
    expect(fake).calledWithExactly(sinon.match.any, expectedOptions);
  });
});

class TransporterMock extends EventEmitter<TransporterEvents> implements Transporter {
  public send(message: string): void {
    // Empty for now
  }
}
