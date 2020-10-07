import { expect } from 'chai';

import sinon = require('sinon');

import { Task, ExpirableTask } from '../../src';

describe(Task.name, () => {
  it('should give access to underlying promise', () => {
    const sut = new Task();
    expect(sut.promise).instanceOf(Promise);
    sut.resolve();
  });

  it('should be able to resolve the underlying promise', async () => {
    const sut = new Task<string>();
    sut.resolve('resolved');
    const result = await sut.promise;
    expect(result).eq('resolved');
  });

  it('should be able to reject the underlying promise', async () => {
    const sut = new Task<string>();
    const expectedError = new Error('expected error');
    sut.reject(expectedError);
    await expect(sut.promise).rejectedWith(expectedError);
  });

  it('should be able to know if it isCompleted', () => {
    const sut = new Task();
    expect(sut.isCompleted).false;
    sut.resolve();
    expect(sut.isCompleted).true;
  });
});

describe(ExpirableTask.name, () => {
  describe('instance', () => {
    it('should timeout after set period', async () => {
      const task = new ExpirableTask(0);
      const result = await task.promise;
      expect(result).eq(ExpirableTask.TimeoutExpired);
    });

    it('should be able to resolve within time', async () => {
      const task = new ExpirableTask<string>(0);
      task.resolve('in time');
      const result = await task.promise;
      expect(result).eq('in time');
    });

    it('should be able to reject within time', async () => {
      const task = new ExpirableTask(0);
      const expectedError = new Error('expected error');
      task.reject(expectedError);
      await expect(task.promise).rejectedWith(expectedError);
    });
  });

  describe('timeout', () => {
    it('should timeout a promise after a set period', async () => {
      const task = new Task();
      const actual = await ExpirableTask.timeout(task.promise, 0);
      expect(actual).eq(ExpirableTask.TimeoutExpired);
      task.resolve(undefined);
    });

    it('should remove any nodejs timers when promise resolves', async () => {
      // Arrange
      const expectedTimer = 234;
      const setTimeoutStub = sinon.stub(global, 'setTimeout');
      const clearTimeoutStub = sinon.stub(global, 'clearTimeout');
      setTimeoutStub.returns(expectedTimer);
      const expectedResult = 'expectedResult';
      const p = Promise.resolve(expectedResult);
      const delay = 10;

      // Act
      const result = await ExpirableTask.timeout(p, delay);

      // Assert
      expect(result).eq(expectedResult);
      expect(clearTimeoutStub).calledWith(expectedTimer);
      expect(setTimeoutStub).calledWith(sinon.match.func, delay);
    });
  });
});
