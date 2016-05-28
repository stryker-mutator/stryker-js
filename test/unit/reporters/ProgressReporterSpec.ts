import ProgressReporter from '../../../src/reporters/ProgressReporter';
import * as sinon from 'sinon';
import {MutantStatus, MutantResult} from '../../../src/api/report';
import {expect} from 'chai';

describe('ProgressReporter', () => {

  let sut: ProgressReporter;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sut = new ProgressReporter();
    sandbox = sinon.sandbox.create();
    sandbox.stub(process.stdout, 'write');
  });

  describe('onMutantTested()', () => {

    describe('when status is KILLED', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.KILLED));
      });
      
      it('should log "."', () => {
        expect(process.stdout.write).to.have.been.calledWith('.');
      });
    });
    
    describe('when status is TIMEDOUT', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.TIMEDOUT));
      });
      
      it('should log "T"', () => {
        expect(process.stdout.write).to.have.been.calledWith('T');
      });
    });
    
    describe('when status is SURVIVED', () => {

      beforeEach(() => {
        sut.onMutantTested(mutantResult(MutantStatus.SURVIVED));
      });
      
      it('should log "S"', () => {
        expect(process.stdout.write).to.have.been.calledWith('S');
      });
    });


  });

  afterEach(() => {
    sandbox.restore();
  });

  function mutantResult(status: MutantStatus): MutantResult {
    return {
      location: null,
      mutatedLines: null,
      mutatorName: null,
      originalLines: null,
      replacement: null,
      sourceFilePath: null,
      specsRan: null,
      status
    }
  }

});
