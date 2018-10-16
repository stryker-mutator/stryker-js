import { expect } from 'chai';
import * as sinon from 'sinon';
import { ReporterFactory } from 'stryker-api/report';
import ReporterOrchestrator from '../../src/ReporterOrchestrator';
import * as broadcastReporter from '../../src/reporters/BroadcastReporter';
import { Mock } from '../helpers/producers';
import currentLogMock from '../helpers/logMock';
import { Logger } from 'stryker-api/logging';

describe('ReporterOrchestrator', () => {
  let sandbox: sinon.SinonSandbox;
  let sut: ReporterOrchestrator;
  let isTTY: boolean;
  let broadcastReporterMock: sinon.SinonStub;
  let log: Mock<Logger>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    broadcastReporterMock = sandbox.stub(broadcastReporter, 'default');
    log = currentLogMock();
    captureTTY();
  });

  afterEach(() => {
    sandbox.restore();
    restoreTTY();
  });

  it('should at least register the 5 default reporters', () => {
    expect(ReporterFactory.instance().knownNames()).length.to.be.above(4);
  });

  describe('createBroadcastReporter()', () => {

    // https://github.com/stryker-mutator/stryker/issues/212
    it('should create "progress-append-only" instead of "progress" reporter if process.stdout is not a tty', () => {
      setTTY(false);
      sut = new ReporterOrchestrator({ reporters: ['progress'] });
      sut.createBroadcastReporter();
      expect(broadcastReporterMock).to.have.been.calledWithNew;
      expect(broadcastReporterMock).to.have.been.calledWith(sinon.match(
        (reporters: broadcastReporter.NamedReporter[]) => reporters[0].name === 'progress-append-only'));
    });

    it('should create the correct reporters', () => {
      setTTY(true);
      sut = new ReporterOrchestrator({ reporters: ['progress', 'progress-append-only'] });
      sut.createBroadcastReporter();
      expect(broadcastReporterMock).to.have.been.calledWith(sinon.match(
        (reporters: broadcastReporter.NamedReporter[]) => reporters[0].name === 'progress' && reporters[1].name === 'progress-append-only'));
    });

    it('should warn if there is no reporter', () => {
      setTTY(true);
      sut = new ReporterOrchestrator({ reporters: [] });
      sut.createBroadcastReporter();
      expect(log.warn).to.have.been.calledTwice;
    });
  });

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
