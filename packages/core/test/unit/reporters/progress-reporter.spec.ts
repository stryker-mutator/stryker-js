import { MatchedMutant, MutantStatus } from '@stryker-mutator/api/report';
import { matchedMutant } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';
import ProgressBar = require('progress');
import { factory } from '@stryker-mutator/test-helpers';

import * as progressBarModule from '../../../src/reporters/progress-bar';
import ProgressReporter from '../../../src/reporters/progress-reporter';
import { Mock, mock } from '../../helpers/producers';

const SECOND = 1000;
const TEN_SECONDS = SECOND * 10;
const HUNDRED_SECONDS = SECOND * 100;
const TEN_THOUSAND_SECONDS = SECOND * 10000;
const ONE_HOUR = SECOND * 3600;

describe('ProgressReporter', () => {
  let sut: ProgressReporter;
  let matchedMutants: MatchedMutant[];
  let progressBar: Mock<ProgressBar>;
  const progressBarContent =
    'Mutation testing  [:bar] :percent (elapsed: :et, remaining: :etc) :tested/:total tested (:survived survived, :timedOut timed out)';

  beforeEach(() => {
    sinon.useFakeTimers();

    sut = new ProgressReporter();

    progressBar = mock(ProgressBar);
    sinon.stub(progressBarModule, 'default').returns(progressBar);
  });

  describe('onAllMutantsMatchedWithTests()', () => {
    describe('when there are 3 MatchedMutants that all contain Tests', () => {
      beforeEach(() => {
        matchedMutants = [matchedMutant({ runAllTests: true }), matchedMutant({ runAllTests: true }), matchedMutant({ runAllTests: true })];

        sut.onAllMutantsMatchedWithTests(matchedMutants);
      });

      it('the total of MatchedMutants in the progress bar should be 3', () => {
        expect(progressBarModule.default).to.have.been.calledWithMatch(progressBarContent, { total: 3 });
      });
    });
    describe("when there are 2 MatchedMutants that all contain Tests and 1 MatchMutant that doesn't have tests", () => {
      beforeEach(() => {
        matchedMutants = [
          matchedMutant({ testFilter: undefined }),
          matchedMutant({ testFilter: ['spec1'] }),
          matchedMutant({ testFilter: ['spec2'] }),
        ];

        sut.onAllMutantsMatchedWithTests(matchedMutants);
      });

      it('the total of MatchedMutants in the progress bar should be 2', () => {
        expect(progressBarModule.default).to.have.been.calledWithMatch(progressBarContent, { total: 2 });
      });
    });
    describe('when mutants match to all tests', () => {
      beforeEach(() => {
        matchedMutants = [matchedMutant({ runAllTests: true }), matchedMutant({ runAllTests: true })];

        sut.onAllMutantsMatchedWithTests(matchedMutants);
      });

      it('the total of MatchedMutants in the progress bar should be 2', () => {
        expect(progressBarModule.default).to.have.been.calledWithMatch(progressBarContent, { total: 2 });
      });
    });
  });

  describe('onMutantTested()', () => {
    let progressBarTickTokens: any;

    beforeEach(() => {
      matchedMutants = [
        matchedMutant({ id: '0' }), // NoCoverage
        matchedMutant({ id: '1', testFilter: [''] }),
        matchedMutant({ id: '2', runAllTests: true }),
        matchedMutant({ id: '3', testFilter: [''] }),
      ];
      sut.onAllMutantsMatchedWithTests(matchedMutants);
    });

    it('should tick the ProgressBar with 1 tested mutant, 0 survived when status is not "Survived"', () => {
      sut.onMutantTested(factory.killedMutantResult());
      progressBarTickTokens = { total: 3, tested: 1, survived: 0 };
      expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
    });

    it("should not tick the ProgressBar if the result was for a mutant that wasn't matched to any tests", () => {
      // mutant 0 isn't matched to any tests
      sut.onMutantTested(factory.invalidMutantResult({ id: '0', status: MutantStatus.CompileError }));
      progressBarTickTokens = { total: 3, tested: 0, survived: 0 };
      expect(progressBar.tick).to.not.have.been.called;
    });

    it('should tick the ProgressBar with 1 survived mutant when status is "Survived"', () => {
      sut.onMutantTested(factory.undetectedMutantResult({ status: MutantStatus.Survived }));
      progressBarTickTokens = { total: 3, tested: 1, survived: 1 };
      expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
    });
  });

  describe('ProgressBar estimated time for 3 mutants', () => {
    beforeEach(() => {
      sut.onAllMutantsMatchedWithTests([
        matchedMutant({ id: '1', runAllTests: true }),
        matchedMutant({ id: '2', runAllTests: true }),
        matchedMutant({ id: '3', runAllTests: true }),
      ]);
    });

    it('should show correct time info after ten seconds and 1 mutants tested', () => {
      sinon.clock.tick(TEN_SECONDS);

      sut.onMutantTested(factory.killedMutantResult({ id: '1' }));

      expect(progressBar.tick).to.have.been.calledWithMatch({ et: '<1m', etc: '<1m' });
    });

    it('should show correct time info after a hundred seconds and 1 mutants tested', () => {
      sinon.clock.tick(HUNDRED_SECONDS);

      sut.onMutantTested(factory.killedMutantResult({ id: '1' }));

      expect(progressBar.tick).to.have.been.calledWithMatch({ et: '~1m', etc: '~3m' });
    });

    it('should show correct time info after ten thousand seconds and 1 mutants tested', () => {
      sinon.clock.tick(TEN_THOUSAND_SECONDS);

      sut.onMutantTested(factory.killedMutantResult({ id: '1' }));

      expect(progressBar.tick).to.have.been.calledWithMatch({ et: '~2h 46m', etc: '~5h 33m' });
    });

    it('should show correct time info after an hour and 1 mutants tested', () => {
      sinon.clock.tick(ONE_HOUR);

      sut.onMutantTested(factory.killedMutantResult({ id: '1', status: MutantStatus.Killed }));

      expect(progressBar.tick).to.have.been.calledWithMatch({ et: '~1h 0m', etc: '~2h 0m' });
    });
  });
});
