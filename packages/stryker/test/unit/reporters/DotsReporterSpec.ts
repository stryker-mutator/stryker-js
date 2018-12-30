import DotsReporter from '../../../src/reporters/DotsReporter';
import * as sinon from 'sinon';
import { MutantStatus, MutantResult } from 'stryker-api/report';
import { expect } from 'chai';
import chalk from 'chalk';
import * as os from 'os';
import * as producers from '../../helpers/producers';

describe('DotsReporter', () => {

  let sut: DotsReporter;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sut = new DotsReporter();
    sandbox = sinon.createSandbox();
    sinon.stub(process.stdout, 'write');
  });

  describe('onMutantTested()', () => {

    describe('when status is Killed', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.Killed));
      });

      it('should log "."', () => {
        expect(process.stdout.write).to.have.been.calledWith('.');
      });
    });

    describe('when status is TimedOut', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.TimedOut));
      });

      it('should log "T"', () => {
        expect(process.stdout.write).to.have.been.calledWith(chalk.yellow('T'));
      });
    });

    describe('when status is Survived', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.Survived));
      });

      it('should log "S"', () => {
        expect(process.stdout.write).to.have.been.calledWith(chalk.bold.red('S'));
      });
    });
  });

  describe('onAllMutantsTested()', () => {
    it('should write a new line', () => {
      sut.onAllMutantsTested();
      expect(process.stdout.write).to.have.been.calledWith(os.EOL);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  function mutantResult(status: MutantStatus): MutantResult {
    return producers.mutantResult({
      location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      mutatedLines: '',
      mutatorName: '',
      originalLines: '',
      range: [0, 0],
      replacement: '',
      sourceFilePath: '',
      status,
      testsRan: ['']
    });
  }

});
