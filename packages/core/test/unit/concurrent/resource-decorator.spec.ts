import { tick } from '@stryker-mutator/test-helpers';
import { Task } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { Resource, ResourceDecorator } from '../../../src/concurrent';

class ResourceDecoratorUnderTest extends ResourceDecorator<Resource> {
  public override recover() {
    return super.recover();
  }
}

describe(ResourceDecorator.name, () => {
  let innerResource1: sinon.SinonStubbedInstance<Resource>;
  let innerResource2: sinon.SinonStubbedInstance<Resource>;
  let sut: ResourceDecoratorUnderTest;

  beforeEach(() => {
    innerResource1 = {
      init: sinon.stub(),
      dispose: sinon.stub(),
    };
    innerResource2 = {
      init: sinon.stub(),
      dispose: sinon.stub(),
    };
    const resources = [innerResource1, innerResource2];
    sut = new ResourceDecoratorUnderTest(() => resources.shift()!);
  });

  (['init', 'dispose'] as const).forEach((method) => {
    describe(method, () => {
      it(`should pass ${method} to the innerResource`, async () => {
        await sut[method]();
        expect(innerResource1[method]).called;
        expect(innerResource2[method]).not.called;
      });

      it(`should not break when the innerResource is missing ${method}`, async () => {
        delete innerResource1[method];
        await expect(sut[method]()).not.rejected;
      });

      it(`should await ${method} on inner innerResource`, async () => {
        const innerTask = new Task();
        innerResource1[method]!.returns(innerTask.promise);
        let isResolved = false;
        const actualInit = sut[method]().then(() => (isResolved = true));
        await tick();
        expect(isResolved).false;
        innerTask.resolve();
        await actualInit;
      });

      it(`should reject when ${method} on inner innerResource rejects`, async () => {
        const expectedError = new Error('Error for testing');
        innerResource1[method]!.rejects(expectedError);
        await expect(sut[method]()).rejectedWith(expectedError);
      });
    });
  });

  describe('recover', () => {
    it('should dispose the old and init the new', async () => {
      await sut.recover();
      expect(innerResource1.dispose).called;
      expect(innerResource2.init).called;
    });

    it('should both await dispose and init', async () => {
      // Arrange
      let recoverResolved = false;
      const initTask = new Task();
      const disposeTask = new Task();
      innerResource1.dispose!.returns(disposeTask.promise);
      innerResource2.init!.returns(initTask.promise);

      // Act
      const onGoingPromise = sut.recover().then(() => (recoverResolved = true));

      // Assert
      expect(innerResource1.dispose).called;
      expect(innerResource2.init).not.called;
      expect(recoverResolved).false;
      disposeTask.resolve();
      await tick();
      expect(innerResource2.init).called;
      expect(recoverResolved).false;
      initTask.resolve();
      await onGoingPromise;
    });
  });
});
