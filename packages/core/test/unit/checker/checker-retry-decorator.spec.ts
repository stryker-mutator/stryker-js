import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { CheckerRetryDecorator } from '../../../src/checker/checker-retry-decorator.js';
import { ChildProcessCrashedError } from '../../../src/child-proxy/child-process-crashed-error.js';
import { OutOfMemoryError } from '../../../src/child-proxy/out-of-memory-error.js';
import { CheckerResource } from '../../../src/concurrent/index.js';

describe(CheckerRetryDecorator.name, () => {
  let innerChecker1: sinon.SinonStubbedInstance<CheckerResource>;
  let innerChecker2: sinon.SinonStubbedInstance<CheckerResource>;
  let sut: CheckerRetryDecorator;

  beforeEach(() => {
    innerChecker1 = {
      init: sinon.stub(),
      check: sinon.stub(),
      dispose: sinon.stub(),
    };
    innerChecker2 = {
      init: sinon.stub(),
      check: sinon.stub(),
      dispose: sinon.stub(),
    };
    const checkers = [innerChecker1, innerChecker2];
    sut = new CheckerRetryDecorator(() => checkers.shift()!, testInjector.logger);
  });

  it('should forward any results', async () => {
    const expectedResult = factory.checkResult();
    const expectedMutant = factory.mutant();
    innerChecker1.check.resolves(expectedResult);
    const actual = await sut.check(expectedMutant);
    expect(actual).eq(expectedResult);
    expect(innerChecker1.check).calledWith(expectedMutant);
  });

  it('should forward normal rejections', async () => {
    const expectedError = new Error('expected error');
    innerChecker1.check.rejects(expectedError);
    await expect(sut.check(factory.mutant())).rejectedWith(expectedError);
  });

  it('should retry when the process crashed', async () => {
    // Arrange
    const expectedResult = factory.checkResult();
    const expectedMutant = factory.mutant();
    const error = new ChildProcessCrashedError(6, 'A bit flipped!');
    innerChecker1.check.rejects(error);
    innerChecker2.check.resolves(expectedResult);

    // Act
    const actualResult = await sut.check(expectedMutant);

    // Assert
    expect(actualResult).eq(expectedResult);
    expect(innerChecker2.check).calledWithExactly(expectedMutant);
  });

  it('should log a warning when the process crashed', async () => {
    // Arrange
    const error = new ChildProcessCrashedError(6, 'A bit flipped!', 3);
    innerChecker1.check.rejects(error);
    innerChecker2.check.resolves(factory.checkResult());

    // Act
    await sut.check(factory.mutant());

    // Assert
    expect(testInjector.logger.warn).calledWithExactly('Checker process [6] crashed with exit code 3. Retrying in a new process.', error);
  });

  it('should log a warning when the process ran out of memory', async () => {
    // Arrange
    const error = new OutOfMemoryError(6, 3);
    innerChecker1.check.rejects(error);
    innerChecker2.check.resolves(factory.checkResult());

    // Act
    await sut.check(factory.mutant());

    // Assert
    expect(testInjector.logger.warn).calledWithExactly('Checker process [6] ran out of memory. Retrying in a new process.');
  });
});
