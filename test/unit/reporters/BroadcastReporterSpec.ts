import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import * as sinon from 'sinon';
import {expect} from 'chai';
import logger from '../../helpers/log4jsMock';

describe('BroadcastReporter', () => {

  let sut: any;
  let reporter: any, reporter2: any;
  const allEvents = ['onSourceFileRead', 'onAllSourceFilesRead', 'onMutantTested', 'onAllMutantsTested', 'wrapUp'];

  beforeEach(() => {
    reporter = mockReporter();
    reporter2 = mockReporter();
    sut = new BroadcastReporter([{ name: 'rep1', reporter }, { name: 'rep2', reporter: reporter2 }]);
  });


  it('should forward all events', () => {
    actArrangeAssertAllEvents();
  });

  describe('when "wrapUp" returns promises', () => {
    let wrapUpResolveFn: Function, wrapUpResolveFn2: Function, wrapUpRejectFn: Function, result: void | Promise<any>, isResolved: boolean;

    beforeEach(() => {
      isResolved = false;
      reporter.wrapUp.returns(new Promise<any>((resolve, reject) => {
        wrapUpResolveFn = resolve;
        wrapUpRejectFn = reject;
      }));
      reporter2.wrapUp.returns(new Promise<any>((resolve) => wrapUpResolveFn2 = resolve));
      result = sut.wrapUp().then(() => isResolved = true);
    });

    it('should forward a combined promise', () => {
      expect(isResolved).to.be.eq(false);
      wrapUpResolveFn();
      wrapUpResolveFn2();
      return result;
    });

    describe('and one of the promises results in a rejection', () => {
      beforeEach(() => {
        wrapUpRejectFn('some error');
        wrapUpResolveFn2();
        return result;
      });

      it('should not result in a rejection', () => result);

      it('should log the error', () => {
        expect(logger.error).to.have.been.calledWith(`An error occurred during 'wrapUp' on reporter 'rep1'. Error is: some error`);
      });
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
    let reporter: any = {};
    allEvents.forEach(event => reporter[event] = sinon.stub());
    return reporter;
  }

  function actArrangeAssertAllEvents() {
    allEvents.forEach(eventName => {
      sut[eventName](eventName);
      expect(reporter[eventName]).to.have.been.calledWith(eventName);
      expect(reporter2[eventName]).to.have.been.calledWith(eventName);
    });
  }
});