import {expect} from 'chai';
import ClearTextReporter from '../../../src/reporters/ClearTextReporter';
import * as sinon from 'sinon';
import {MutantStatus, MutantResult} from 'stryker-api/report';
import * as chalk from 'chalk';

describe('ClearTextReporter', function () {
  let sut: ClearTextReporter;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(process.stdout, 'write');
    sut = new ClearTextReporter();
  });

  describe('onAllMutantsTested()', () => {

    beforeEach(() => {
      sut.onAllMutantsTested(mutantResults(MutantStatus.KILLED, MutantStatus.SURVIVED, MutantStatus.TIMEDOUT, MutantStatus.UNTESTED));
    });

    it('should report on the survived mutant', () => {
      expect(process.stdout.write).to.have.been.calledWith('Mutator: Math\n');
      expect(process.stdout.write).to.have.been.calledWith(chalk.red('-   original line') + '\n');
      expect(process.stdout.write).to.have.been.calledWith(chalk.green('+   mutated line') + '\n');
    });

    it('should make a correct calculation', () => {
      expect(process.stdout.write).to.have.been.calledWith(`Mutation score based on all code: ${chalk.red('50.00%')}\n`);
      expect(process.stdout.write).to.have.been.calledWith(`Mutation score based on covered code: ${chalk.yellow('66.67%')}\n`);
    });

  });

  function mutantResults(...status: MutantStatus[]): MutantResult[] {
    return status.map(status => {
      return {
        location: { start: { line: 1, column: 2 }, end: { line: 3, column: 4 } },
        range: null,
        mutatedLines: 'mutated line',
        mutatorName: 'Math',
        originalLines: 'original line',
        replacement: '',
        sourceFilePath: '',
        testsRan: [''],
        status
      };
    });
  }

  afterEach(() => sandbox.restore());
});
