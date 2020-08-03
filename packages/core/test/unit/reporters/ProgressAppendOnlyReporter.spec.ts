import * as os from 'os';

import { MutantStatus } from '@stryker-mutator/api/report';
import { matchedMutant, mutantResult } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';

import ProgressAppendOnlyReporter from '../../../src/reporters/ProgressAppendOnlyReporter';

const SECOND = 1000;
const TEN_SECONDS = SECOND * 10;
const HUNDRED_SECONDS = SECOND * 100;
const THOUSAND_SECONDS = SECOND * 1000;
const TEN_THOUSAND_SECONDS = SECOND * 10000;

describe(ProgressAppendOnlyReporter.name, () => {
  let sut: ProgressAppendOnlyReporter;

  beforeEach(() => {
    sut = new ProgressAppendOnlyReporter();
    sinon.useFakeTimers();
    sinon.stub(process.stdout, 'write');
  });

  describe('onAllMutantsMatchedWithTests() with 3 mutants to test', () => {
    beforeEach(() => {
      sut.onAllMutantsMatchedWithTests([
        matchedMutant({ runAllTests: true }),
        matchedMutant({ runAllTests: true }),
        matchedMutant({ runAllTests: true }),
      ]);
    });

    it('should not show show progress directly', () => {
      expect(process.stdout.write).to.not.have.been.called;
    });

    it('should log correct info after ten seconds without completed tests', () => {
      sinon.clock.tick(TEN_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 0% (elapsed: <1m, remaining: n/a) 0/3 tested (0 survived, 0 timed out)${os.EOL}`
      );
    });

    it('should log correct info after ten seconds with 1 completed test', () => {
      sut.onMutantTested(mutantResult({ status: MutantStatus.Killed }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(TEN_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 33% (elapsed: <1m, remaining: <1m) 1/3 tested (0 survived, 0 timed out)${os.EOL}`
      );
    });

    it('should log correct info after a hundred seconds with 1 completed test', () => {
      sut.onMutantTested(mutantResult({ status: MutantStatus.Killed }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(HUNDRED_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 33% (elapsed: ~1m, remaining: ~3m) 1/3 tested (0 survived, 0 timed out)${os.EOL}`
      );
    });

    it('should log correct info after a thousand seconds with 1 completed test', () => {
      sut.onMutantTested(mutantResult({ status: MutantStatus.Killed }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(THOUSAND_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 33% (elapsed: ~16m, remaining: ~33m) 1/3 tested (0 survived, 0 timed out)${os.EOL}`
      );
    });

    it('should log correct info after ten thousand seconds with 1 completed test', () => {
      sut.onMutantTested(mutantResult({ status: MutantStatus.TimedOut }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(TEN_THOUSAND_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 33% (elapsed: ~2h 46m, remaining: ~5h 33m) 1/3 tested (0 survived, 1 timed out)${os.EOL}`
      );
    });
  });
});
