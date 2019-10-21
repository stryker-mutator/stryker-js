import { MutantStatus } from '@stryker-mutator/api/report';
import { matchedMutant, mutantResult } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as os from 'os';
import * as sinon from 'sinon';
import ProgressAppendOnlyReporter from '../../../src/reporters/ProgressAppendOnlyReporter';

const SECOND = 1000;
const TEN_SECONDS = SECOND * 10;
const HUNDRED_SECONDS = SECOND * 100;
const TEN_THOUSAND_SECONDS = SECOND * 10000;

describe('ProgressAppendOnlyReporter', () => {
  let sut: ProgressAppendOnlyReporter;

  beforeEach(() => {
    sut = new ProgressAppendOnlyReporter();
    sinon.useFakeTimers();
    sinon.stub(process.stdout, 'write');
  });

  describe('onAllMutantsMatchedWithTests() with 2 mutant to test', () => {
    beforeEach(() => {
      sut.onAllMutantsMatchedWithTests([matchedMutant(1), matchedMutant(1)]);
    });

    it('should not show show progress directly', () => {
      expect(process.stdout.write).to.not.have.been.called;
    });

    it('should log zero progress after ten seconds without completed tests', () => {
      sinon.clock.tick(TEN_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith('Mutation testing 0% (ETC n/a) ' + `0/2 tested (0 survived)${os.EOL}`);
    });

    it('should log 50% with 10s ETC after ten seconds with 1 completed test', () => {
      sut.onMutantTested(mutantResult({ status: MutantStatus.Killed }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(TEN_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(`Mutation testing 50% (ETC 10s) 1/2 tested (0 survived)${os.EOL}`);
    });

    it('should log 50% with "1m, 40s" ETC after hundred seconds with 1 completed test', () => {
      sut.onMutantTested(mutantResult({ status: MutantStatus.Killed }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(HUNDRED_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(`Mutation testing 50% (ETC 1m, 40s) 1/2 tested (0 survived)${os.EOL}`);
    });

    it('should log 50% with "2h, 46m, 40s" ETC after ten tousand seconds with 1 completed test', () => {
      sut.onMutantTested(mutantResult({ status: MutantStatus.Killed }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(TEN_THOUSAND_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(`Mutation testing 50% (ETC 2h, 46m, 40s) 1/2 tested (0 survived)${os.EOL}`);
    });
  });
});
