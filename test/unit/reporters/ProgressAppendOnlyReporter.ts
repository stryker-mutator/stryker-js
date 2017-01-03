import * as os from 'os';
import * as sinon from 'sinon';
import * as chalk from 'chalk';
import { expect } from 'chai';
import { MatchedMutant, MutantResult, MutantStatus } from 'stryker-api/report';
import ProgressAppendOnlyReporter from '../../../src/reporters/ProgressAppendOnlyReporter';

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

    it('should log zero first progress after 10s without completed tests', () => {
      sandbox.clock.tick(10000);
      expect(process.stdout.write).to.have.been.calledWith(`Mutation testing 0% (ETC n/a) ` +
        `[0 ${chalk.green.bold('killed')}] ` +
        `[0 ${chalk.red.bold('survived')}] ` +
        `[0 ${chalk.red.bold('no coverage')}] ` +
        `[0 ${chalk.yellow.bold('timeout')}] ` +
        `[0 ${chalk.yellow.bold('error')}]${os.EOL}`);
    });

    it('should should log 50% with 10s ETC after 10s with 1 completed test', () => {
      sut.onMutantTested(mutantResult(MutantStatus.Killed));
      expect(process.stdout.write).to.not.have.been.called;
      sandbox.clock.tick(10000);
      expect(process.stdout.write).to.have.been.calledWith(`Mutation testing 50% (ETC 10s) ` +
        `[1 ${chalk.green.bold('killed')}] ` +
        `[0 ${chalk.red.bold('survived')}] ` +
        `[0 ${chalk.red.bold('no coverage')}] ` +
        `[0 ${chalk.yellow.bold('timeout')}] ` +
        `[0 ${chalk.yellow.bold('error')}]${os.EOL}`);
    });
  });
});
function matchedMutant(numberOfTests: number): MatchedMutant {
  let scopedTestIds: number[] = [];
  for (let i = 0; i < numberOfTests; i++) {
    scopedTestIds.push(1);
  }
  return {
    mutatorName: null,
    scopedTestIds: scopedTestIds,
    timeSpentScopedTests: null,
    filename: null,
    replacement: null
  };
}
function mutantResult(status: MutantStatus): MutantResult {
  return {
    location: null,
    mutatedLines: null,
    mutatorName: null,
    originalLines: null,
    replacement: null,
    sourceFilePath: null,
    testsRan: null,
    status,
    range: null
  };
}
