import { MatchedMutant, MutantStatus } from '@stryker-mutator/api/report';
import { matchedMutant, MUTANT_RESULT } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as progressBarModule from '../../../src/reporters/ProgressBar';
import ProgressReporter from '../../../src/reporters/ProgressReporter';
import { Mock, mock } from '../../helpers/producers';
import ProgressBar = require('progress');

const second = 1000;
const tenSeconds = second * 10;
const hundredSeconds = second * 100;
const tenThousandSeconds = second * 10000;
const oneHour = second * 3600;

describe('ProgressReporter', () => {

  let sut: ProgressReporter;
  let matchedMutants: MatchedMutant[];
  let progressBar: Mock<ProgressBar>;
  const progressBarContent = `Mutation testing  [:bar] :percent (ETC :etc) :tested/:total tested (:survived survived)`;

  beforeEach(() => {
    sinon.useFakeTimers();

    sut = new ProgressReporter();

    progressBar = mock(ProgressBar);
    sinon.stub(progressBarModule, 'default').returns(progressBar);
  });

  describe('onAllMutantsMatchedWithTests()', () => {
    describe('when there are 3 MatchedMutants that all contain Tests', () => {
      beforeEach(() => {
        matchedMutants = [matchedMutant(1), matchedMutant(4), matchedMutant(2)];

        sut.onAllMutantsMatchedWithTests(matchedMutants);
      });

      it('the total of MatchedMutants in the progress bar should be 3', () => {
        expect(progressBarModule.default).to.have.been.calledWithMatch(progressBarContent, { total: 3 });
      });
    });
    describe('when there are 2 MatchedMutants that all contain Tests and 1 MatchMutant that doesn\'t have tests', () => {
      beforeEach(() => {
        matchedMutants = [matchedMutant(1), matchedMutant(0), matchedMutant(2)];

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
      matchedMutants = [matchedMutant(0), matchedMutant(1), matchedMutant(4), matchedMutant(2)];
      sut.onAllMutantsMatchedWithTests(matchedMutants);
    });

    it('should tick the ProgressBar with 1 tested mutant, 0 survived when status is not "Survived"', () => {
      sut.onMutantTested(MUTANT_RESULT({ status: MutantStatus.Killed }));
      progressBarTickTokens = { total: 3, tested: 1, survived: 0 };
      expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
    });

    it('should not tick the ProgressBar if the result was for a mutant that wasn\'t matched to any tests', () => {
      // mutant 0 isn't matched to any tests
      sut.onMutantTested(MUTANT_RESULT({ id: '0', status: MutantStatus.TranspileError }));
      progressBarTickTokens = { total: 3, tested: 0, survived: 0 };
      expect(progressBar.tick).to.not.have.been.called;
    });

    it('should tick the ProgressBar with 1 survived mutant when status is "Survived"', () => {
      sut.onMutantTested(MUTANT_RESULT({ status: MutantStatus.Survived }));
      progressBarTickTokens = { total: 3, tested: 1, survived: 1 };
      expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
    });
  });

  describe('ProgressBar estimate time', () => {
    beforeEach(() => {
      sut.onAllMutantsMatchedWithTests([matchedMutant(1), matchedMutant(1)]);
    });

    it('should show to an estimate of "10s" in the progressBar after ten seconds and 1 mutants tested', () => {
      sinon.clock.tick(tenSeconds);

      sut.onMutantTested(MUTANT_RESULT({ status: MutantStatus.Killed }));

      expect(progressBar.tick).to.have.been.calledWithMatch({ etc: '10s' });
    });

    it('should show to an estimate of "1m, 40s" in the progressBar after hundred seconds and 1 mutants tested', () => {
      sinon.clock.tick(hundredSeconds);

      sut.onMutantTested(MUTANT_RESULT({ status: MutantStatus.Killed }));

      expect(progressBar.tick).to.have.been.calledWithMatch({ etc: '1m, 40s' });
    });

    it('should show to an estimate of "2h, 46m, 40s" in the progressBar after ten thousand seconds and 1 mutants tested', () => {
      sinon.clock.tick(tenThousandSeconds);

      sut.onMutantTested(MUTANT_RESULT({ status: MutantStatus.Killed }));

      expect(progressBar.tick).to.have.been.calledWithMatch({ etc: '2h, 46m, 40s' });
    });

    it('should show to an estimate of "1h, 0m, 0s" in the progressBar after an hour and 1 mutants tested', () => {
      sinon.clock.tick(oneHour);

      sut.onMutantTested(MUTANT_RESULT({ status: MutantStatus.Killed }));

      expect(progressBar.tick).to.have.been.calledWithMatch({ etc: '1h, 0m, 0s' });
    });
  });
});
