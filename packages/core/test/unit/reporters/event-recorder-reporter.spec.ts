import fs from 'fs';

import { Reporter } from '@stryker-mutator/api/report';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { EventRecorderReporter } from '../../../src/reporters/event-recorder-reporter.js';
import { StrictReporter } from '../../../src/reporters/strict-reporter.js';
import { fileUtils } from '../../../src/utils/file-utils.js';

describe(EventRecorderReporter.name, () => {
  let sut: StrictReporter;
  let cleanFolderStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;

  beforeEach(() => {
    cleanFolderStub = sinon.stub(fileUtils, 'cleanFolder');
    writeFileStub = sinon.stub(fs.promises, 'writeFile');
  });

  describe('when constructed with empty options', () => {
    describe('and cleanFolder resolves correctly', () => {
      beforeEach(() => {
        cleanFolderStub.returns(Promise.resolve());
        sut = testInjector.injector.injectClass(EventRecorderReporter);
      });

      it('should clean the baseFolder', () => {
        expect(fileUtils.cleanFolder).to.have.been.calledWith('reports/mutation/events');
      });

      const arrangeActAssertEvent = (eventName: keyof Reporter) => {
        describe(`${eventName} event`, () => {
          let writeFileRejection: Error | undefined;
          const expected = { some: 'eventData' };

          const arrange = () =>
            beforeEach(() => {
              writeFileRejection = undefined;
              (sut[eventName] as any)(expected);
              return (sut.wrapUp() as Promise<void>).then(
                () => void 0,
                (error) => (writeFileRejection = error)
              );
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
              expect(fs.promises.writeFile).to.have.been.calledWith(sinon.match(RegExp(`.*0000\\d-${eventName}\\.json`)), JSON.stringify(expected)));
          });
        });
      };

      factory.ALL_REPORTER_EVENTS.filter((event) => event !== 'wrapUp').forEach(arrangeActAssertEvent);
    });

    describe('and cleanFolder results in a rejection', () => {
      let expectedError: Error;
      beforeEach(() => {
        expectedError = new Error('Some error 1');
        cleanFolderStub.rejects(expectedError);
        sut = testInjector.injector.injectClass(EventRecorderReporter);
      });

      it('should reject when `wrapUp()` is called', async () => {
        await expect(sut.wrapUp()).rejectedWith(expectedError);
      });
    });
  });
});
