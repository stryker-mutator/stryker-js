import { expect } from 'chai';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import { ALL_REPORTER_EVENTS } from '../../helpers/producers';
import { PluginKind, StrykerPlugin } from 'stryker-api/di';
import * as sinon from 'sinon';
import ProgressAppendOnlyReporter from '../../../src/reporters/ProgressAppendOnlyReporter';
import ProgressReporter from '../../../src/reporters/ProgressReporter';
import { TestInjector } from '@stryker-mutator/test-helpers';

describe('BroadcastReporter', () => {

  let sut: BroadcastReporter;
  let rep1: any;
  let rep2: any;
  let isTTY: boolean;

  beforeEach(() => {
    rep1 = mockReporter('rep1');
    rep2 = mockReporter('rep2');
    captureTTY();
    TestInjector.options.reporters = ['rep1', 'rep2'];
    const rep1Plugin: StrykerPlugin<any, any> = class {
      public static readonly pluginName = 'rep1';
      public static readonly inject: [] = [];
      public static readonly kind = PluginKind.Reporter;
    };
    const rep2Plugin: StrykerPlugin<any, any> = class {
      public static readonly pluginName = 'rep2';
      public static readonly inject: [] = [];
      public static readonly kind = PluginKind.Reporter;
    };
    TestInjector.pluginResolver.resolve
      .withArgs(PluginKind.Reporter, rep1Plugin.pluginName).returns(rep1Plugin)
      .withArgs(PluginKind.Reporter, rep2Plugin.pluginName).returns(rep2Plugin);
    TestInjector
      .stub(rep1Plugin, rep1)
      .stub(rep2Plugin, rep2);
  });

  afterEach(() => {
    restoreTTY();
  });

  describe('when constructed', () => {
    it('should create "progress-append-only" instead of "progress" reporter if process.stdout is not a tty', () => {
      // Arrange
      setTTY(false);
      const expectedReporter = mockReporter('progress-append-only');
      TestInjector.options.reporters = ['progress'];
      TestInjector.pluginResolver.resolve.withArgs(PluginKind.Reporter, 'progress-append-only').returns(ProgressAppendOnlyReporter);
      TestInjector.stub(ProgressAppendOnlyReporter, expectedReporter);

      // Act
      sut = createSut();

      // Assert
      expect(sut.reporters).deep.eq({ 'progress-append-only': expectedReporter });
    });

    it('should create the correct reporters', () => {
      // Arrange
      setTTY(true);
      const expectedReporter = mockReporter('progress');
      TestInjector.options.reporters = ['progress', 'rep2'];
      TestInjector.pluginResolver.resolve.withArgs(PluginKind.Reporter, 'progress').returns(ProgressReporter);
      TestInjector.stub(ProgressReporter, expectedReporter);

      // Act
      sut = createSut();

      // Assert
      expect(sut.reporters).deep.eq({
        progress: expectedReporter,
        rep2
      });
    });

    it('should warn if there is no reporter', () => {
      TestInjector.options.reporters = [];
      sut = createSut();
      expect(TestInjector.logger.warn).calledWith(sinon.match('No reporter configured'));
    });
  });

  describe('when created', () => {
    beforeEach(() => {
      sut = createSut();
    });

    it('should forward all events', () => {
      actArrangeAssertAllEvents();
    });

    describe('when "wrapUp" returns promises', () => {
      let wrapUpResolveFn: Function;
      let wrapUpResolveFn2: Function;
      let wrapUpRejectFn: Function;
      let result: Promise<void>;
      let isResolved: boolean;

      beforeEach(() => {
        isResolved = false;
        rep1.wrapUp.returns(new Promise<void>((resolve, reject) => {
          wrapUpResolveFn = resolve;
          wrapUpRejectFn = reject;
        }));
        rep2.wrapUp.returns(new Promise<void>(resolve => wrapUpResolveFn2 = resolve));
        result = sut.wrapUp().then(() => void (isResolved = true));
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
          expect(TestInjector.logger.error).calledWith(`An error occurred during 'wrapUp' on reporter 'rep1'. Error is: some error`);
        });
      });
    });

    describe('with one faulty reporter', () => {

      beforeEach(() => {
        ALL_REPORTER_EVENTS.forEach(eventName => rep1[eventName].throws('some error'));
      });

      it('should still broadcast to other reporters', () => {
        actArrangeAssertAllEvents();
      });

      it('should log each error', () => {
        ALL_REPORTER_EVENTS.forEach(eventName => {
          (sut as any)[eventName]();
          expect(TestInjector.logger.error).to.have.been.calledWith(`An error occurred during '${eventName}' on reporter 'rep1'. Error is: some error`);
        });
      });

    });

  });

  function createSut() {
    return TestInjector.inject(BroadcastReporter);
  }

  function mockReporter(name: string) {
    const reporter: any = { name };
    ALL_REPORTER_EVENTS.forEach(event => reporter[event] = sinon.stub());
    return reporter;
  }

  function actArrangeAssertAllEvents() {
    ALL_REPORTER_EVENTS.forEach(eventName => {
      const eventData = eventName === 'wrapUp' ? undefined : eventName;
      (sut as any)[eventName](eventName);
      expect(rep1[eventName]).to.have.been.calledWith(eventData);
      expect(rep2[eventName]).to.have.been.calledWith(eventData);
    });
  }

  function captureTTY() {
    isTTY = (process.stdout as any).isTTY;
  }

  function restoreTTY() {
    (process.stdout as any).isTTY = isTTY;
  }

  function setTTY(val: boolean) {
    (process.stdout as any).isTTY = val;
  }
});
