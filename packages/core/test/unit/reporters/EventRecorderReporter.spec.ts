import { Reporter } from '@stryker-mutator/api/report';
import { testInjector } from '@stryker-mutator/test-helpers';
import { ALL_REPORTER_EVENTS } from '@stryker-mutator/test-helpers/src/factory';
import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as sinon from 'sinon';
import EventRecorderReporter from '../../../src/reporters/EventRecorderReporter';
import StrictReporter from '../../../src/reporters/StrictReporter';
import * as fileUtils from '../../../src/utils/fileUtils';

describe('EventRecorderReporter', () => {
  let sut: StrictReporter;
  let cleanFolderStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;

  beforeEach(() => {
    cleanFolderStub = sinon.stub(fileUtils, 'cleanFolder');
    writeFileStub = sinon.stub(fsAsPromised, 'writeFile');
  });

  describe('when constructed with empty options', () => {
    describe('and cleanFolder resolves correctly', () => {
      beforeEach(() => {
        cleanFolderStub.returns(Promise.resolve());
        sut = testInjector.injector.injectClass(EventRecorderReporter);
      });

      it('should log about the default baseFolder', () => {
        expect(testInjector.logger.debug).to.have.been.calledWith(
          "No base folder configuration found (using configuration: eventReporter: { baseDir: 'output/folder' }), using default reports/mutation/events"
        );
      });

      it('should clean the baseFolder', () => {
        expect(fileUtils.cleanFolder).to.have.been.calledWith('reports/mutation/events');
      });

      const arrangeActAssertEvent = (eventName: keyof Reporter) => {
        describe(`${eventName} event`, () => {
          let writeFileRejection: undefined | Error;
          const expected: any = { some: 'eventData' };

          const arrange = () =>
            beforeEach(() => {
              writeFileRejection = undefined;
              (sut[eventName] as any)(expected);
              return (sut.wrapUp() as Promise<void>).then(() => void 0, error => (writeFileRejection = error));
            });

          describe('when writeFile results in a rejection', () => {
            const expectedError = new Error('some error');
            beforeEach(() => writeFileStub.rejects(expectedError));
            arrange();

            it('should reject `wrapUp`', () => expect(writeFileRejection).to.be.eq(expectedError));
          });

          describe('when writeFile is successful', () => {
            arrange();
            it('should writeFile', () =>
              expect(fsAsPromised.writeFile).to.have.been.calledWith(sinon.match(RegExp(`.*0000\\d-${eventName}\\.json`)), JSON.stringify(expected)));
          });
        });
      };

      ALL_REPORTER_EVENTS.filter(event => event !== 'wrapUp').forEach(arrangeActAssertEvent);
    });

    describe('and cleanFolder results in a rejection', () => {
      let expectedError: Error;
      beforeEach(() => {
        expectedError = new Error('Some error 1');
        cleanFolderStub.rejects(expectedError);
        sut = testInjector.injector.injectClass(EventRecorderReporter);
      });

      it('should reject when `wrapUp()` is called', () => {
        expect(sut.wrapUp()).rejectedWith(expectedError);
      });
    });
  });
});
