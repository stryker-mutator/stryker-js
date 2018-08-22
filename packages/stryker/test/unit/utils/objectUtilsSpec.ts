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
});
