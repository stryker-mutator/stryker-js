import { expect } from 'chai';
import sinon from 'sinon';
import ProgressBar from 'progress';
import { factory } from '@stryker-mutator/test-helpers';
import { MutantStatus, MutantTestCoverage } from '@stryker-mutator/api/core';

import * as progressBarModule from '../../../src/reporters/progress-bar';
import { ProgressBarReporter } from '../../../src/reporters/progress-reporter';
import { Mock, mock } from '../../helpers/producers';

const SECOND = 1000;
const TEN_SECONDS = SECOND * 10;
const HUNDRED_SECONDS = SECOND * 100;
const TEN_THOUSAND_SECONDS = SECOND * 10000;
const ONE_HOUR = SECOND * 3600;

describe(ProgressBarReporter.name, () => {
  let sut: ProgressBarReporter;
  let mutants: MutantTestCoverage[];
  let progressBar: Mock<ProgressBar>;
  const progressBarContent =
    'Mutation testing  [:bar] :percent (elapsed: :et, remaining: :etc) :tested/:total tested (:survived survived, :timedOut timed out)';

  beforeEach(() => {
    sinon.useFakeTimers();
    sut = new ProgressBarReporter();
    progressBar = mock(ProgressBar);
    sinon.stub(progressBarModule, 'ProgressBar').returns(progressBar);
  });

  describe('onAllMutantsMatchedWithTests()', () => {
    it('should show a progress bar for 3 mutants with 3 static mutants ', () => {
      mutants = [
        factory.mutantTestCoverage({ static: true }),
        factory.mutantTestCoverage({ static: true }),
        factory.mutantTestCoverage({ static: true }),
      ];

      sut.onAllMutantsMatchedWithTests(mutants);

      expect(progressBarModule.ProgressBar).calledWithMatch(progressBarContent, { total: 3 });
    });

    it('should show a progress bar for 2 mutants when 3 mutants are presented of which 2 have coverage', () => {
      mutants = [
        factory.mutantTestCoverage({ coveredBy: undefined }),
        factory.mutantTestCoverage({ coveredBy: ['spec1'] }),
        factory.mutantTestCoverage({ coveredBy: ['spec2'] }),
      ];

      sut.onAllMutantsMatchedWithTests(mutants);
      expect(progressBarModule.ProgressBar).calledWithMatch(progressBarContent, { total: 2 });
    });

    it('should show a progress bar of 2 mutants when 3 mutants are presented of which 1 is static and 1 has coverage', () => {
      mutants = [
        factory.mutantTestCoverage({ static: true }),
        factory.mutantTestCoverage({ coveredBy: ['spec1'] }),
        factory.mutantTestCoverage({ static: false, coveredBy: undefined }),
      ];

      sut.onAllMutantsMatchedWithTests(mutants);
      expect(progressBarModule.ProgressBar).calledWithMatch(progressBarContent, { total: 2 });
    });
  });

  describe('onMutantTested()', () => {
    let progressBarTickTokens: any;

    beforeEach(() => {
      mutants = [
        factory.mutantTestCoverage({ coveredBy: undefined, static: false }), // NoCoverage
        factory.mutantTestCoverage({ coveredBy: [''] }),
        factory.mutantTestCoverage({ static: true }),
        factory.mutantTestCoverage({ coveredBy: [''] }),
      ];
      sut.onAllMutantsMatchedWithTests(mutants);
    });

    it('should tick the ProgressBar with 1 tested mutant, 0 survived when status is not "Survived"', () => {
      sut.onMutantTested(factory.killedMutantResult());
      progressBarTickTokens = { total: 3, tested: 1, survived: 0 };
      expect(progressBar.tick).calledWithMatch(progressBarTickTokens);
    });

    it("should not tick the ProgressBar if the result was for a mutant that wasn't matched to any tests", () => {
      sut.onMutantTested(factory.mutantResult({ coveredBy: undefined, static: false }));
      progressBarTickTokens = { total: 3, tested: 0, survived: 0 };
      expect(progressBar.tick).to.not.have.been.called;
    });

    it('should tick the ProgressBar with 1 survived mutant when status is "Survived"', () => {
      sut.onMutantTested(factory.mutantResult({ static: true, status: MutantStatus.Survived }));
      progressBarTickTokens = { total: 3, tested: 1, survived: 1 };
      expect(progressBar.tick).calledWithMatch(progressBarTickTokens);
    });
  });

  describe('ProgressBar estimated time for 3 mutants', () => {
    beforeEach(() => {
      sut.onAllMutantsMatchedWithTests([
        factory.mutantTestCoverage({ static: true }),
        factory.mutantTestCoverage({ static: true }),
        factory.mutantTestCoverage({ static: true }),
      ]);
    });

    it('should show correct time info after ten seconds and 1 mutants tested', () => {
      sinon.clock.tick(TEN_SECONDS);

      sut.onMutantTested(factory.mutantResult({ static: true }));

      expect(progressBar.tick).calledWithMatch({ et: '<1m', etc: '<1m' });
    });

    it('should show correct time info after a hundred seconds and 1 mutants tested', () => {
      sinon.clock.tick(HUNDRED_SECONDS);

      sut.onMutantTested(factory.mutantResult({ static: true }));

      expect(progressBar.tick).calledWithMatch({ et: '~1m', etc: '~3m' });
    });

    it('should show correct time info after ten thousand seconds and 1 mutants tested', () => {
      sinon.clock.tick(TEN_THOUSAND_SECONDS);

      sut.onMutantTested(factory.mutantResult({ static: true }));

      expect(progressBar.tick).calledWithMatch({ et: '~2h 46m', etc: '~5h 33m' });
    });

    it('should show correct time info after an hour and 1 mutants tested', () => {
      sinon.clock.tick(ONE_HOUR);

      sut.onMutantTested(factory.mutantResult({ status: MutantStatus.Killed }));

      expect(progressBar.tick).calledWithMatch({ et: '~1h 0m', etc: '~2h 0m' });
    });
  });
});
