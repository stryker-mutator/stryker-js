import * as sinon from 'sinon';
import { Logger } from 'log4js';
import { expect } from 'chai';
import currentLogMock from '../../helpers/log4jsMock';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import { ALL_REPORTER_EVENTS, Mock } from '../../helpers/producers';

describe('BroadcastReporter', () => {

  let log: Mock<Logger>;
  let sut: any;
  let reporter: any, reporter2: any;

  beforeEach(() => {
    log = currentLogMock();
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
        expect(log.error).to.have.been.calledWith(`An error occurred during 'wrapUp' on reporter 'rep1'. Error is: some error`);
      });
    });
  });

  describe('with one faulty reporter', () => {

    beforeEach(() => {
      ALL_REPORTER_EVENTS.forEach(eventName => reporter[eventName].throws('some error'));
    });

    it('should still broadcast to other reporters', () => {
      actArrangeAssertAllEvents();
    });

    it('should log each error', () => {
      ALL_REPORTER_EVENTS.forEach(eventName => {
        sut[eventName]();
        expect(log.error).to.have.been.calledWith(`An error occurred during '${eventName}' on reporter 'rep1'. Error is: some error`);
      });
    });

  });


  function mockReporter() {
    let reporter: any = {};
    ALL_REPORTER_EVENTS.forEach(event => reporter[event] = sinon.stub());
    return reporter;
  }

  function actArrangeAssertAllEvents() {
    ALL_REPORTER_EVENTS.forEach(eventName => {
      const eventData = eventName === 'wrapUp' ? undefined : eventName;
      sut[eventName](eventName);
      expect(reporter[eventName]).to.have.been.calledWith(eventData);
      expect(reporter2[eventName]).to.have.been.calledWith(eventData);
    });
  }
});