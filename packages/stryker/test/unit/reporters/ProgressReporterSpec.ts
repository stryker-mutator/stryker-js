import * as sinon from 'sinon';
import { expect } from 'chai';
import { MutantStatus, MatchedMutant } from 'stryker-api/report';
import ProgressReporter from '../../../src/reporters/ProgressReporter';
import * as progressBarModule from '../../../src/reporters/ProgressBar';
import { matchedMutant, mutantResult, Mock, mock } from '../../helpers/producers';
import ProgressBar = require('progress');

describe('ProgressReporter', () => {

  let sut: ProgressReporter;
  let sandbox: sinon.SinonSandbox;
  let matchedMutants: MatchedMutant[];
  let progressBar: Mock<ProgressBar>;
  const progressBarContent: string =
    `Mutation testing  [:bar] :percent (ETC :etas) :tested/:total tested (:survived survived)`;

  beforeEach(() => {
    sut = new ProgressReporter();
    sandbox = sinon.createSandbox();
    progressBar = mock(ProgressBar);
    sandbox.stub(progressBarModule, 'default').returns(progressBar);
  });

  afterEach(() => {
    sandbox.restore();
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
      sut.onMutantTested(mutantResult({ status: MutantStatus.Killed }));
      progressBarTickTokens = { total: 3, tested: 1, survived: 0 };
      expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
    });

    it('should not tick the ProgressBar if the result was for a mutant that wasn\'t matched to any tests', () => {
      // mutant 0 isn't matched to any tests
      sut.onMutantTested(mutantResult({ id: '0', status: MutantStatus.TranspileError }));
      progressBarTickTokens = { total: 3, tested: 0, survived: 0 };
      expect(progressBar.tick).to.not.have.been.called;
    });

    it('should tick the ProgressBar with 1 survived mutant when status is "Survived"', () => {
      sut.onMutantTested(mutantResult({ status: MutantStatus.Survived }));
      progressBarTickTokens = { total: 3, tested: 1, survived: 1 };
      expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
    });
  });
});
