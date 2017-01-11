import * as sinon from 'sinon';
import * as chalk from 'chalk';
import { expect } from 'chai';
import { MutantStatus, MutantResult, MatchedMutant } from 'stryker-api/report';
import ProgressReporter from '../../../src/reporters/ProgressReporter';
import * as progressBarModule from '../../../src/reporters/ProgressBar';
import { matchedMutant, mutantResult } from '../../helpers/producers';

describe('ProgressReporter', () => {

  let sut: ProgressReporter;
  let sandbox: sinon.SinonSandbox;
  let matchedMutants: MatchedMutant[];
  let progressBar: { tick: sinon.SinonStub, render: sinon.SinonStub };
  const progressBarContent: string =
    `Mutation testing  [:bar] :percent (ETC :etas)` +
    `[:killed :killedLabel] ` +
    `[:survived :survivedLabel] ` +
    `[:noCoverage :noCoverageLabel] ` +
    `[:timeout :timeoutLabel] ` +
    `[:error :errorLabel]`;

  beforeEach(() => {
    sut = new ProgressReporter();
    sandbox = sinon.sandbox.create();
    progressBar = { tick: sandbox.stub(), render: sandbox.stub() };
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

      it('the total of MatchedMutants in the progressbar should be 3', () => {
        expect(progressBarModule.default).to.have.been.calledWithMatch(progressBarContent, { total: 3 });
      });
    });
    describe('when there are 2 MatchedMutants that all contain Tests and 1 MatchMutant that doesnt have tests', () => {
      beforeEach(() => {
        matchedMutants = [matchedMutant(1), matchedMutant(0), matchedMutant(2)];

        sut.onAllMutantsMatchedWithTests(matchedMutants);
      });

      it('the total of MatchedMutants in the progressbar should be 2', () => {
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

    describe('when status is KILLED', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.Killed));
      });

      it('should tick the ProgressBar with 1 killed mutant', () => {
        progressBarTickTokens = { error: 0, killed: 1, noCoverage: 0, survived: 0, timeout: 0 };
        expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
      });
    });

    describe('when status is TIMEDOUT', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.TimedOut));
      });

      it('should tick the ProgressBar with 1 timed out mutant', () => {
        progressBarTickTokens = { error: 0, killed: 0, noCoverage: 0, survived: 0, timeout: 1 };
        expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
      });
    });

    describe('when status is SURVIVED', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.Survived));
      });

      it('should tick the ProgressBar with 1 survived mutant', () => {
        progressBarTickTokens = { error: 0, killed: 0, noCoverage: 0, survived: 1, timeout: 0 };
        expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
      });
    });

    describe('when status is ERRORED', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.Error));
      });

      it('should tick the ProgressBar with 1 errored mutant', () => {
        progressBarTickTokens = { error: 1, killed: 0, noCoverage: 0, survived: 0, timeout: 0 };
        expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
      });
    });

    describe('when status is NO COVERAGE', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.NoCoverage));
      });

      it('should not tick the ProgressBar', () => {
        expect(progressBar.tick).to.not.have.been.called;
      });

      it('should render the ProgressBar', () => {
        progressBarTickTokens = { error: 0, killed: 0, noCoverage: 1, survived: 0, timeout: 0 };
        expect(progressBar.render).to.have.been.calledWithMatch(progressBarTickTokens);
      });
    });
  });
});
