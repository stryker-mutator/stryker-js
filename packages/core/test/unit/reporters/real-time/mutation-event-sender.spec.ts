import sinon from 'sinon';

import { MutantResult, MutantStatus } from 'mutation-testing-report-schema/api';

import { MutationEventSender } from '../../../../src/reporters/real-time/mutation-event-sender.js';
import { SseClient } from '../../../../src/reporters/real-time/sse-client.js';

describe(MutationEventSender.name, () => {
  let clientMock: sinon.SinonStubbedInstance<SseClient>;
  let sut: MutationEventSender;

  beforeEach(() => {
    clientMock = sinon.createStubInstance(SseClient);
    sut = new MutationEventSender(clientMock);
  });

  it('should send mutant-tested correctly', () => {
    const mutant: Partial<MutantResult> = {
      id: '1',
      status: MutantStatus.Pending,
    };

    sut.sendMutantTested(mutant);

    sinon.assert.calledOnceWithExactly(clientMock.send, 'mutant-tested', { id: '1', status: MutantStatus.Pending });
  });

  it('should send finished correctly', () => {
    sut.sendFinished();

    sinon.assert.calledOnceWithExactly(clientMock.send, 'finished', {});
  });
});
