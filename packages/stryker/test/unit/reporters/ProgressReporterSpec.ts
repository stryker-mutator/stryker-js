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
    sandbox = sinon.sandbox.create();
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
      matchedMutants = [matchedMutant(1), matchedMutant(4), matchedMutant(2)];

      sut.onAllMutantsMatchedWithTests(matchedMutants);
    });

    describe('when status is not "Survived"', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult({ status: MutantStatus.Killed }));
      });

      it('should tick the ProgressBar with 1 tested mutant, 0 survived', () => {
        progressBarTickTokens = { total: 3, tested: 1, survived: 0 };
        expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
      });
    });

    describe('when status is "Survived"', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult({ status: MutantStatus.Survived }));
      });

      it('should tick the ProgressBar with 1 survived mutant', () => {
        progressBarTickTokens = { total: 3, tested: 1, survived: 1 };
        expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
      });
    });
  });
});
