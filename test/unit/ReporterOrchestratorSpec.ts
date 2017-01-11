import * as sinon from 'sinon';
import { expect } from 'chai';
import * as broadcastReporter from '../../src/reporters/BroadcastReporter';
import ReporterOrchestrator from '../../src/ReporterOrchestrator';
import { ReporterFactory } from 'stryker-api/report';

describe('ReporterOrchestrator', () => {
  let sandbox: sinon.SinonSandbox;
  let sut: ReporterOrchestrator;
  let isTTY: boolean;
  let broadcastReporterMock: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    broadcastReporterMock = sandbox.stub(broadcastReporter, 'default');
    captureTTY();
  });

  afterEach(() => {
    sandbox.restore();
    restoreTTY();
  });

  it('should register default reporters', () => {
    expect(ReporterFactory.instance().knownNames()).to.have.lengthOf(5);
  });

  describe('createBroadcastReporter()', () => {

    // https://github.com/stryker-mutator/stryker/issues/212
    it('should create "progress-append-only" instead of "progress" reporter if process.stdout is not a tty', () => {
      setTTY(false);
      sut = new ReporterOrchestrator({ reporter: 'progress' });
      sut.createBroadcastReporter();
      expect(broadcastReporterMock).to.have.been.calledWithNew;
      expect(broadcastReporterMock).to.have.been.calledWith(sinon.match(
        (reporters: broadcastReporter.NamedReporter[]) => reporters[0].name === 'progress-append-only'));
    });

    it('should create the correct reporters', () => {
      setTTY(true);
      sut = new ReporterOrchestrator({ reporter: ['progress', 'progress-append-only'] });
      sut.createBroadcastReporter();
      expect(broadcastReporterMock).to.have.been.calledWith(sinon.match(
        (reporters: broadcastReporter.NamedReporter[]) => reporters[0].name === 'progress' && reporters[1].name === 'progress-append-only'));
    });
  });

  function captureTTY() {
    isTTY = (process.stdout as any)['isTTY'];
  }

  function restoreTTY() {
    (process.stdout as any)['isTTY'] = isTTY;
  }

  function setTTY(val: boolean) {
    (process.stdout as any)['isTTY'] = val;
  }
});