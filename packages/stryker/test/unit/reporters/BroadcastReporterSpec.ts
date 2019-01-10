import { expect } from 'chai';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import { ALL_REPORTER_EVENTS } from '../../helpers/producers';
import { PluginKind, FactoryPlugin } from 'stryker-api/plugin';
import * as sinon from 'sinon';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { Reporter } from 'stryker-api/report';

describe('BroadcastReporter', () => {

  let sut: BroadcastReporter;
  let rep1Plugin: MockedReporterPlugin;
  let rep2Plugin: MockedReporterPlugin;
  let isTTY: boolean;

  beforeEach(() => {
    captureTTY();
    testInjector.options.reporters = ['rep1', 'rep2'];
    rep1Plugin = mockReporterPlugin('rep1');
    rep2Plugin = mockReporterPlugin('rep2');
  });

  afterEach(() => {
    restoreTTY();
  });

  describe('when constructed', () => {
    it('should create "progress-append-only" instead of "progress" reporter if process.stdout is not a tty', () => {
      // Arrange
      setTTY(false);
      const expectedReporterPlugin = mockReporterPlugin('progress-append-only');
      testInjector.options.reporters = ['progress'];

      // Act
      sut = createSut();

      // Assert
      expect(sut.reporters).deep.eq({ 'progress-append-only': expectedReporterPlugin.reporterStub });
    });

    it('should create the correct reporters', () => {
      // Arrange
      setTTY(true);
      testInjector.options.reporters = ['progress', 'rep2'];
      const progressReporterPlugin = mockReporterPlugin('progress');

      // Act
      sut = createSut();

      // Assert
      expect(sut.reporters).deep.eq({
        progress: progressReporterPlugin.reporterStub,
        rep2: rep2Plugin.reporterStub
      });
    });

    it('should warn if there is no reporter', () => {
      testInjector.options.reporters = [];
      sut = createSut();
      expect(testInjector.logger.warn).calledWith(sinon.match('No reporter configured'));
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
        rep1Plugin.reporterStub.wrapUp.returns(new Promise<void>((resolve, reject) => {
          wrapUpResolveFn = resolve;
          wrapUpRejectFn = reject;
        }));
        rep2Plugin.reporterStub.wrapUp.returns(new Promise<void>(resolve => wrapUpResolveFn2 = resolve));
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
          expect(testInjector.logger.error).calledWith(`An error occurred during 'wrapUp' on reporter 'rep1'. Error is: some error`);
        });
      });
    });

    describe('with one faulty reporter', () => {

      beforeEach(() => {
        ALL_REPORTER_EVENTS.forEach(eventName => rep1Plugin.reporterStub[eventName].throws('some error'));
      });

      it('should still broadcast to other reporters', () => {
        actArrangeAssertAllEvents();
      });

      it('should log each error', () => {
        ALL_REPORTER_EVENTS.forEach(eventName => {
          (sut as any)[eventName]();
          expect(testInjector.logger.error).to.have.been.calledWith(`An error occurred during '${eventName}' on reporter 'rep1'. Error is: some error`);
        });
      });

    });

  });

  function createSut() {
    return testInjector.injector.injectClass(BroadcastReporter);
  }

  type MockedReporterPlugin = FactoryPlugin<PluginKind.Reporter, []> & { reporterStub: sinon.SinonStubbedInstance<Required<Reporter>> };

  function mockReporterPlugin(name: string): MockedReporterPlugin {
    const reporterStub = factory.reporter();
    (reporterStub as any)[name] = name;
    const reporterPlugin: MockedReporterPlugin = {
      factory() {
        return reporterStub;
      },
      kind: PluginKind.Reporter,
      name,
      reporterStub
    };
    testInjector.pluginResolver.resolve
      .withArgs(PluginKind.Reporter, reporterPlugin.name).returns(reporterPlugin);
    return reporterPlugin;
  }

  function actArrangeAssertAllEvents() {
    ALL_REPORTER_EVENTS.forEach(eventName => {
      const eventData = eventName === 'wrapUp' ? undefined : eventName;
      (sut as any)[eventName](eventName);
      expect(rep1Plugin.reporterStub[eventName]).to.have.been.calledWith(eventData);
      expect(rep2Plugin.reporterStub[eventName]).to.have.been.calledWith(eventData);
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
