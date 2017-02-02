import { expect } from 'chai';
import * as sinon from 'sinon';
import StrictReporter from '../../../src/reporters/StrictReporter';
import * as fileUtils from '../../../src/utils/fileUtils';
import log from '../../helpers/log4jsMock';
import EventRecorderReporter from '../../../src/reporters/EventRecorderReporter';

describe('EventRecorderReporter', () => {

  let sut: StrictReporter;
  let sandbox: sinon.SinonSandbox;
  let cleanFolderStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    cleanFolderStub = sandbox.stub(fileUtils, 'cleanFolder');
    writeFileStub = sandbox.stub(fileUtils, 'writeFile');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when constructed with empty options', () => {

    describe('and cleanFolder resolves correctly', () => {
      beforeEach(() => {
        cleanFolderStub.returns(Promise.resolve());
        sut = new EventRecorderReporter({}) as any;
      });

      it('should log about the default baseFolder', () => {
        expect(log.debug).to.have.been.calledWith(`No base folder configuration found (using configuration: eventReporter: { baseDir: 'output/folder' }), using default reports/mutation/events`);
      });

      it('should clean the baseFolder', () => {
        expect(fileUtils.cleanFolder).to.have.been.calledWith('reports/mutation/events');
      });

      let arrangeActAssertEvent = (eventName: string) => {
        describe(`${eventName}`, () => {

          let writeFileRejection: any;
          const expected: any = { some: 'eventData' };

          let arrange = () => beforeEach(() => {
            writeFileRejection = undefined;
            (sut as any)[eventName](expected);
            return (sut.wrapUp() as Promise<any>).then(() => void 0, (error) => writeFileRejection = error);
          });

          describe('when writeFile results in a rejection', () => {
            const expectedError = new Error('some error');
            beforeEach(() => writeFileStub.rejects(expectedError));
            arrange();

            it('should reject `wrapUp`', () => expect(writeFileRejection).to.be.eq(expectedError));
          });

          describe('when writeFile is successful', () => {
            arrange();
            it('should writeFile', () => expect(fileUtils.writeFile).to.have.been.calledWith(sinon.match(RegExp(`.*0000\\d-${eventName}\\.json`)), JSON.stringify(expected)));
          });
        });
      };

      ['onSourceFileRead', 'onAllSourceFilesRead', 'onAllMutantsMatchedWithTests', 'onMutantTested', 'onAllMutantsTested']
        .forEach(arrangeActAssertEvent);
    });

    describe('and cleanFolder results in a rejection', () => {
      let expectedError: Error;
      beforeEach(() => {
        expectedError = new Error('Some error');
        cleanFolderStub.rejects(expectedError);
        sut = new EventRecorderReporter({}) as any;
      });

      describe('and `wrapUp()` is called', () => {
        let result: any;

        beforeEach(() => {
          let promise = <Promise<any>>sut.wrapUp();
          return promise.then(() => result = true, (error: any) => result = error);
        });

        it('should reject', () => expect(result).to.be.eq(expectedError));
      });
    });
  });

});