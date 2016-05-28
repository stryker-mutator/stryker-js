import {expect} from 'chai';
import ClearTextReporter from '../../../src/reporters/ClearTextReporter';
import * as sinon from 'sinon';
import {MutantStatus, MutantResult} from '../../../src/api/report';

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
      expect(process.stdout.write).to.have.been.calledWith('-   original line\n');
      expect(process.stdout.write).to.have.been.calledWith('+   mutated line\n');
    });

    it('should make a correct calculation', () => {
      expect(process.stdout.write).to.have.been.calledWith('Mutation score based on all code: 50.00%\n');
      expect(process.stdout.write).to.have.been.calledWith('Mutation score based on covered code: 66.67%\n');
    });

  });

  function mutantResults(...status: MutantStatus[]): MutantResult[] {
    return status.map(s => {
      return {
        location: { start: { line: 1, column: 2 }, end: { line: 3, column: 4 } },
        mutatedLines: 'mutated line',
        mutatorName: 'Math',
        originalLines: 'original line',
        replacement: '',
        sourceFilePath: '',
        specsRan: [''],
        status: s
      }
    });
  }

  afterEach(() => sandbox.restore());
});
