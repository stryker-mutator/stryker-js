import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import {Reporter} from '../../../src/api/report';
import * as sinon from 'sinon';
import {expect} from 'chai';
import logger from '../../helpers/log4jsMock';

describe('BroadcastReporter', () => {

  let sut: any;
  let reporter: any, reporter2: any;
  const allEvents = ['onSourceFileRead', 'onAllSourceFilesRead', 'onMutantTested', 'onAllMutantsTested'];

  beforeEach(() => {
    reporter = mockReporter();
    reporter2 = mockReporter();
    sut = new BroadcastReporter([{ name: 'rep1', reporter }, { name: 'rep2', reporter: reporter2 }]);
  });

  describe('happy flow', () => {

    it('should forward all requests', () => {
      actArrangeAssertAllEvents();
    });
  });

  describe('with one faulty reporter', () => {

    beforeEach(() => {
      allEvents.forEach(eventName => reporter[eventName].throws('some error'));
    });

    it('should still broadcast to other reporters', () => {
      actArrangeAssertAllEvents();
    });
    
    it('should log each error', () => {
      allEvents.forEach(eventName => {
        sut[eventName]();
        expect(logger.error).to.have.been.calledWith(`An error occurred during '${eventName}' on reporter 'rep1'. Error is: some error`);
      });
    });

  });

  function mockReporter() {
    return {
      onSourceFileRead: sinon.stub(),
      onAllSourceFilesRead: sinon.stub(),
      onMutantTested: sinon.stub(),
      onAllMutantsTested: sinon.stub()
    }
  }

  function actArrangeAssertAllEvents() {
    allEvents.forEach(eventName => {
      sut[eventName](eventName);
      expect(reporter[eventName]).to.have.been.calledWith(eventName);
      expect(reporter2[eventName]).to.have.been.calledWith(eventName);
    });
  }
});