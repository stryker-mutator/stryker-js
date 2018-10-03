import * as sut from '../../../src/utils/objectUtils';
import { expect } from 'chai';
import { match } from 'sinon';
import { Task } from '../../../src/utils/Task';

describe('objectUtils', () => {
  describe('timeout', () => {
    it('should timeout a promise after a set period', async () => {
      const task = new Task();
      const actual = await sut.timeout(task.promise, 0);
      expect(actual).eq(sut.TimeoutExpired);
      task.resolve(undefined);
    });

    it('should remove any nodejs timers when promise resolves', async () => {
      // Arrange
      const expectedTimer = 234;
      const setTimeoutStub = sandbox.stub(global, 'setTimeout');
      const clearTimeoutStub = sandbox.stub(global, 'clearTimeout');
      setTimeoutStub.returns(expectedTimer);
      const expectedResult = 'expectedResult';
      const p = Promise.resolve(expectedResult);
      const delay = 10;

      // Act
      const result = await sut.timeout(p, delay);

      // Assert
      expect(result).eq(expectedResult);
      expect(clearTimeoutStub).calledWith(expectedTimer);
      expect(setTimeoutStub).calledWith(match.func, delay);
    });
  });

  describe('unwrapTimeout', () => {
    it('should return the result if timeout did not expire', async () => {
      const result: string | typeof sut.TimeoutExpired = 'timeout did not expire';
      const actual = sut.unwrapTimeout(result, 'This error should not be thrown');
      expect(actual).eq('timeout did not expire');
    });

    it('should throw an error if timeout expired', async () => {
      const result: string | typeof sut.TimeoutExpired = sut.TimeoutExpired;
      const actual = () => sut.unwrapTimeout(result, 'This error should be thrown');
      expect(actual).to.throw(Error, 'This error should be thrown');
    });
  });
});
