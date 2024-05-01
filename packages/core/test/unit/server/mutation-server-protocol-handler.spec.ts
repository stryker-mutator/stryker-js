import { EventEmitter } from 'events';

import sinon from 'sinon';
import { createJSONRPCRequest, createJSONRPCSuccessResponse } from 'json-rpc-2.0';
import { expect } from 'chai';

import { MutantResult } from '@stryker-mutator/api/core';

import { MutateParams, MutationServerProtocolHandler } from '../../../src/server/index.js';
import { Transporter, TransporterEvents } from '../../../src/server/transport/transporter.js';
import { MutationTestMethod } from '../../../src/server/methods/mutation-test-method.js';

describe(MutationServerProtocolHandler.name, () => {
  let transporterMock: TransporterMock;

  beforeEach(() => {
    transporterMock = new TransporterMock();
    new MutationServerProtocolHandler(transporterMock);
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

    // Wait for the event loop to finish
    await new Promise((res) => setTimeout(res, 10));

    // Assert
    const successResponse = createJSONRPCSuccessResponse(1, mutationTestResult);
    expect(sendSpy).calledOnceWith(JSON.stringify(successResponse));
  });
});

class TransporterMock extends EventEmitter<TransporterEvents> implements Transporter {
  public send(message: string): void {
    // Empty for now
  }
}
