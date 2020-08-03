import os = require('os');

import { expect } from 'chai';
import sinon = require('sinon');
import { toArray } from 'rxjs/operators';
import { testInjector } from '@stryker-mutator/test-helpers';

import { ConcurrencyTokenProvider } from '../../../src/concurrent';

describe(ConcurrencyTokenProvider.name, () => {
  function createSut() {
    return testInjector.injector.injectClass(ConcurrencyTokenProvider);
  }

  it('should log about processes', async () => {
    testInjector.options.concurrency = 9;
    const sut = createSut();
    expect(testInjector.logger.info).calledWith('Creating %s test runner process(es).', 9);
    sut.dispose();
  });

  it('should log about processes created inc checkers', async () => {
    testInjector.options.concurrency = 9;
    testInjector.options.checkers = ['typescript'];
    const sut = createSut();
    expect(testInjector.logger.info).calledWith('Creating %s checker process(es) and %s test runner process(es).', 5, 4);
    sut.dispose();
  });

  describe('testRunnerToken$', () => {
    it('should use cpuCount - 1 if concurrency is not set', async () => {
      sinon.stub(os, 'cpus').returns([0, 1, 2]);
      const sut = createSut();
      const actualTokens = await actAllTestRunnerTokens(sut);
      expect(actualTokens).deep.eq([0, 1]);
    });

    it('should allow half of the concurrency when there are checkers configured', async () => {
      testInjector.options.concurrency = 8;
      testInjector.options.checkers = ['typescript'];
      const sut = createSut();
      const actualTokens = await actAllTestRunnerTokens(sut);
      expect(actualTokens).deep.eq([0, 1, 2, 3]);
    });

    it('should allow floor half of the concurrency when there are checkers configured', async () => {
      testInjector.options.concurrency = 9;
      testInjector.options.checkers = ['typescript'];
      const sut = createSut();
      const actualTokens = await actAllTestRunnerTokens(sut);
      expect(actualTokens).deep.eq([0, 1, 2, 3]);
    });

    it('should emit 4 more tokens when the checkers are freed', async () => {
      testInjector.options.concurrency = 8;
      testInjector.options.checkers = ['typescript'];
      const sut = createSut();
      const allTokens: number[] = [];
      sut.testRunnerToken$.subscribe((token) => allTokens.push(token));
      expect(allTokens).lengthOf(4);
      sut.freeCheckers();
      expect(allTokens).lengthOf(8);
      sut.dispose();
    });

    function actAllTestRunnerTokens(sut: ConcurrencyTokenProvider): Promise<number[]> {
      const tokens = sut.testRunnerToken$.pipe(toArray()).toPromise();
      sut.dispose();
      return tokens;
    }
  });

  describe('checkerToken$', () => {
    it('should emit one value when there are no checkers configured (no actual process will be created in that case)', async () => {
      testInjector.options.checkers = [];
      const sut = createSut();
      const tokens = await sut.checkerToken$.pipe(toArray()).toPromise();
      expect(tokens).deep.eq([0]);
      sut.dispose();
    });

    it('should emit 3 values if concurrency is 6', async () => {
      testInjector.options.checkers = ['typescript'];
      testInjector.options.concurrency = 6;
      const sut = createSut();
      const tokens = await sut.checkerToken$.pipe(toArray()).toPromise();
      expect(tokens).deep.eq([0, 1, 2]);
      sut.dispose();
    });

    it('should emit 4 values if concurrency is 7', async () => {
      testInjector.options.checkers = ['typescript'];
      testInjector.options.concurrency = 7;
      const sut = createSut();
      const tokens = await sut.checkerToken$.pipe(toArray()).toPromise();
      expect(tokens).deep.eq([0, 1, 2, 3]);
      sut.dispose();
    });
  });

  describe('dispose', () => {
    it('should complete the subject(s)', () => {
      // Arrange
      testInjector.options.checkers = ['typescript'];
      testInjector.options.concurrency = 6;
      const sut = createSut();
      const allCheckerTokens: number[] = [];
      const allTestRunnerTokens: number[] = [];
      let checkersCompleted = false;
      let testRunnersCompleted = false;
      sut.checkerToken$.subscribe({
        next(n) {
          allCheckerTokens.push(n);
        },
        complete() {
          checkersCompleted = true;
        },
      });
      sut.testRunnerToken$.subscribe({
        next(n) {
          allTestRunnerTokens.push(n);
        },
        complete() {
          testRunnersCompleted = true;
        },
      });

      // Act & assert
      expect(allTestRunnerTokens).deep.eq([0, 1, 2]);
      expect(allCheckerTokens).deep.eq([0, 1, 2]);
      expect(checkersCompleted).true;
      expect(testRunnersCompleted).false;
      sut.dispose();
      expect(checkersCompleted).true;
      expect(testRunnersCompleted).true;
    });
  });
});
