import os from 'os';

import { expect } from 'chai';
import sinon from 'sinon';
import { lastValueFrom, toArray } from 'rxjs';
import { testInjector } from '@stryker-mutator/test-helpers';

import { ConcurrencyTokenProvider } from '../../../src/concurrent/index.js';

describe(ConcurrencyTokenProvider.name, () => {
  function createSut() {
    return testInjector.injector.injectClass(ConcurrencyTokenProvider);
  }

  it('should log about processes', () => {
    testInjector.options.concurrency = 9;
    const sut = createSut();
    expect(testInjector.logger.info).calledWith(
      'Creating %s test runner process(es).',
      9,
    );
    sut.dispose();
  });

  it('should log about processes created inc checkers', () => {
    testInjector.options.concurrency = 9;
    testInjector.options.checkers = ['typescript'];
    const sut = createSut();
    expect(testInjector.logger.info).calledWith(
      'Creating %s checker process(es) and %s test runner process(es).',
      5,
      4,
    );
    sut.dispose();
  });

  describe('testRunnerToken$', () => {
    it('should use availableParallelism if concurrency is not set and availableParallelism <= 4', async () => {
      sinon.stub(os, 'availableParallelism').returns(4);
      const sut = createSut();
      const actualTokens = await actAllTestRunnerTokens(sut);
      expect(actualTokens).deep.eq([0, 1, 2, 3]);
    });

    it('should use availableParallelism - 1 if concurrency is not set and availableParallelism > 4', async () => {
      sinon.stub(os, 'availableParallelism').returns(5);
      const sut = createSut();
      const actualTokens = await actAllTestRunnerTokens(sut);
      expect(actualTokens).deep.eq([0, 1, 2, 3]);
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

    it('should emit 4 more tokens when the checkers are freed', () => {
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

    function actAllTestRunnerTokens(
      sut: ConcurrencyTokenProvider,
    ): Promise<number[]> {
      const tokens = lastValueFrom(sut.testRunnerToken$.pipe(toArray()));
      sut.dispose();
      return tokens;
    }
  });

  describe('checkerToken$', () => {
    it('should emit one value when there are no checkers configured (no actual process will be created in that case)', async () => {
      testInjector.options.checkers = [];
      const sut = createSut();
      const tokens = await lastValueFrom(sut.checkerToken$.pipe(toArray()));
      expect(tokens).deep.eq([0]);
      sut.dispose();
    });

    it('should emit 3 values if concurrency is 6', async () => {
      testInjector.options.checkers = ['typescript'];
      testInjector.options.concurrency = 6;
      const sut = createSut();
      const tokens = await lastValueFrom(sut.checkerToken$.pipe(toArray()));
      expect(tokens).deep.eq([0, 1, 2]);
      sut.dispose();
    });

    it('should emit 4 values if concurrency is 7', async () => {
      testInjector.options.checkers = ['typescript'];
      testInjector.options.concurrency = 7;
      const sut = createSut();
      const tokens = await lastValueFrom(sut.checkerToken$.pipe(toArray()));
      expect(tokens).deep.eq([0, 1, 2, 3]);
      sut.dispose();
    });
  });

  describe('concurrency percentage', () => {
    it('should convert "50%" to half of available parallelism', () => {
      sinon.stub(os, 'availableParallelism').returns(8);
      testInjector.options.concurrency = '50%';
      const sut = createSut();
      expect(testInjector.logger.debug).calledWith(
        'Computed concurrency %s from "%s" based on %s available parallelism.',
        4,
        '50%',
        8,
      );
      sut.dispose();
    });

    it('should convert "100%" to full available parallelism', () => {
      sinon.stub(os, 'availableParallelism').returns(4);
      testInjector.options.concurrency = '100%';
      const sut = createSut();
      expect(testInjector.logger.debug).calledWith(
        'Computed concurrency %s from "%s" based on %s available parallelism.',
        4,
        '100%',
        4,
      );
      sut.dispose();
    });

    it('should round to nearest integer', () => {
      sinon.stub(os, 'availableParallelism').returns(3);
      testInjector.options.concurrency = '50%';
      const sut = createSut();
      // 3 * 0.5 = 1.5, rounded to 2
      expect(testInjector.logger.debug).calledWith(
        'Computed concurrency %s from "%s" based on %s available parallelism.',
        2,
        '50%',
        3,
      );
      sut.dispose();
    });

    it('should enforce minimum of 1 for "0%"', () => {
      sinon.stub(os, 'availableParallelism').returns(2);
      testInjector.options.concurrency = '0%';
      const sut = createSut();
      expect(testInjector.logger.debug).calledWith(
        'Computed concurrency %s from "%s" based on %s available parallelism.',
        1,
        '0%',
        2,
      );
      sut.dispose();
    });

    it('should not convert invalid percentage format like "abc50%" as percentage', () => {
      sinon.stub(os, 'availableParallelism').returns(8);
      testInjector.options.concurrency = 'abc50%';
      const sut = createSut();
      // Should use default logic (availableParallelism - 1 since 8 > 4)
      expect(testInjector.logger.info).calledWith(
        'Creating %s test runner process(es).',
        7,
      );
      sut.dispose();
    });

    it('should not convert percentages over 100% because they fail schema validation', () => {
      sinon.stub(os, 'availableParallelism').returns(8);
      // This scenario should be prevented by schema validation, but test defensive code
      testInjector.options.concurrency = '150%';
      const sut = createSut();
      // Should use default logic (availableParallelism - 1 since 8 > 4)
      expect(testInjector.logger.info).calledWith(
        'Creating %s test runner process(es).',
        7,
      );
      sut.dispose();
    });

    it('should not convert invalid percentage format like "50%abc" as percentage', () => {
      sinon.stub(os, 'availableParallelism').returns(8);
      testInjector.options.concurrency = '50%abc' as any;
      const sut = createSut();
      // Should use default logic (availableParallelism - 1 since 8 > 4)
      expect(testInjector.logger.info).calledWith(
        'Creating %s test runner process(es).',
        7,
      );
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
