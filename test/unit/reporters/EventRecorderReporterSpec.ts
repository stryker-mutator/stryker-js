import EventRecorderReporter from '../../../src/reporters/EventRecorderReporter';
import * as fileUtils from '../../../src/utils/fileUtils';
import * as sinon from 'sinon';
import log from '../../helpers/log4jsMock';
import { expect } from 'chai';
import { ALL_EVENT_METHOD_NAMES } from '../../../src/reporters/BroadcastReporter';
import StrictReporter from '../../../src/reporters/StrictReporter';

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
        sut = new EventRecorderReporter({});
      });

      it('should log about the default baseFolder', () => {
        expect(log.debug).to.have.been.calledWith(`No base folder configuration found (using configuration: eventReporter: { baseDir: 'output/folder' }), using default reports/mutation/events`);
      });

      it('should clean the baseFolder', () => {
        expect(fileUtils.cleanFolder).to.have.been.calledWith('reports/mutation/events');
      });

      let arrangeActAssertEvent = (eventName: string) => {
        describe(`${eventName} event`, () => {

          let writeFileRejection: any;
          const expected: any = { some: 'eventData' };

          let arrange = () => beforeEach(() => {
            writeFileRejection = undefined;
            (<any>sut)[eventName](expected);
            return (<Promise<any>>sut.wrapUp()).then(() => void 0, (error) => writeFileRejection = error);
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

      ALL_EVENT_METHOD_NAMES.forEach(arrangeActAssertEvent);
    });

    describe('and cleanFolder results in a rejection', () => {
      let expectedError: Error;
      beforeEach(() => {
        expectedError = new Error('Some error');
        cleanFolderStub.rejects(expectedError);
        sut = new EventRecorderReporter({});
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