import EventRecorderReporter from '../../../src/reporters/EventRecorderReporter';
import * as fileUtils from '../../../src/utils/fileUtils';
import {Reporter, MutantStatus, MutantResult} from 'stryker-api/report';
import * as sinon from 'sinon';
import log from '../../helpers/log4jsMock';
import {expect} from 'chai';
import {ALL_EVENT_METHOD_NAMES} from '../../../src/reporters/BroadcastReporter';


describe('EventRecorderReporter', () => {

  let sut: Reporter;
  let sandbox: sinon.SinonSandbox;
  let cleanFolderStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    cleanFolderStub = sandbox.stub(fileUtils, 'cleanFolder');
    writeFileStub = sandbox.stub(fileUtils, 'writeFile');
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
            beforeEach(() => writeFileStub.returns(Promise.reject('some error')));
            arrange();

            it('should reject `wrapUp`', () => expect(writeFileRejection).to.be.eq('some error'));
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
      beforeEach(() => {
        cleanFolderStub.returns(Promise.reject('Some error'));
        sut = new EventRecorderReporter({});
      });

      describe('and `wrapUp()` is called', () => {
        let result: any;

        beforeEach(() => {
          let promise = <Promise<any>>sut.wrapUp();
          return promise.then(() => result = true, (error: any) => result = error);
        });

        it('should reject', () => expect(result).to.be.eq('Some error'));
      })

    });

  });

  afterEach(() => {
    sandbox.restore();
  });
});