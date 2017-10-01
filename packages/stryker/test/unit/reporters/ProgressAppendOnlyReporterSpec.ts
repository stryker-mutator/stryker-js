import * as os from 'os';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { MutantStatus } from 'stryker-api/report';
import ProgressAppendOnlyReporter from '../../../src/reporters/ProgressAppendOnlyReporter';
import { matchedMutant, mutantResult } from '../../helpers/producers';

describe('ProgressAppendOnlyReporter', () => {
  let sut: ProgressAppendOnlyReporter;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sut = new ProgressAppendOnlyReporter();
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers();
    sandbox.stub(process.stdout, 'write');
  });

  afterEach(() => sandbox.restore());

  describe('onAllMutantsMatchedWithTests() with 2 mutant to test', () => {

    beforeEach(() => {
      sut.onAllMutantsMatchedWithTests([matchedMutant(1), matchedMutant(1)]);
    });

    it('should not show show progress directly', () => {
      expect(process.stdout.write).to.not.have.been.called;
    });

    it('should log zero progress after 10s without completed tests', () => {
      sandbox.clock.tick(10000);
      expect(process.stdout.write).to.have.been.calledWith(`Mutation testing 0% (ETC n/a) ` +
      `0/2 tested (0 survived)${os.EOL}`);
    });

    it('should should log 50% with 10s ETC after 10s with 1 completed test', () => {
      sut.onMutantTested(mutantResult({ status: MutantStatus.Killed }));
      expect(process.stdout.write).to.not.have.been.called;
      sandbox.clock.tick(10000);
      expect(process.stdout.write).to.have.been.calledWith(`Mutation testing 50% (ETC 10s) 1/2 tested (0 survived)${os.EOL}`);
    });
  });
});
