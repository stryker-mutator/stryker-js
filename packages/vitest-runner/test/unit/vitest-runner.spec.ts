import sinon from 'sinon';
import { expect } from 'chai';
import fs from 'fs';
import {
  assertions,
  factory,
  testInjector,
} from '@stryker-mutator/test-helpers';
import {
  TestRunnerCapabilities,
  TestStatus,
} from '@stryker-mutator/api/test-runner';
import { Vitest } from 'vitest/node';

import { VitestTestRunner } from '../../src/vitest-test-runner.js';
import { VitestRunnerOptionsWithStrykerOptions } from '../../src/vitest-runner-options-with-stryker-options.js';
import { vitestWrapper } from '../../src/vitest-wrapper.js';
import {
  createVitestFile,
  createVitestMock,
  createVitestTest,
} from '../util/factories.js';
import { VITEST_ERROR_CODES } from '../../src/vitest-helpers.js';

describe(VitestTestRunner.name, () => {
  let sut: VitestTestRunner;
  let createVitestStub: sinon.SinonStubbedMember<
    typeof vitestWrapper.createVitest
  >;
  let options: VitestRunnerOptionsWithStrykerOptions;
  let vitestStub: sinon.SinonStubbedInstance<Vitest>;

  beforeEach(() => {
    sut = testInjector.injector
      .provideValue('globalNamespace', '__stryker2__' as const)
      .injectClass(VitestTestRunner);
    createVitestStub = sinon.stub(vitestWrapper, 'createVitest');
    options = testInjector.options as VitestRunnerOptionsWithStrykerOptions;
    options.vitest = {
      related: true,
    };
    vitestStub = createVitestMock();
    createVitestStub.resolves(vitestStub);
    sinon.stub(fs.promises, 'copyFile').resolves();
    sinon.stub(fs.promises, 'rm').resolves();
  });

  it('should not have reload capabilities', () => {
    // The files under test are cached between runs
    const expectedCapabilities: TestRunnerCapabilities = {
      reloadEnvironment: true,
    };
    expect(sut.capabilities()).deep.eq(expectedCapabilities);
  });

  describe(VitestTestRunner.prototype.dispose.name, () => {
    it('should not throw when not initialized', async () => {
      await expect(sut.dispose()).not.rejected;
    });
  });

  describe(VitestTestRunner.prototype.init.name, () => {
    it('should initialize the vitest environment', async () => {
      await sut.init();

      sinon.assert.calledOnceWithExactly(createVitestStub, 'test', {
        config: undefined,
        // @ts-expect-error threads got renamed to "pool: threads" in vitest 1.0.0
        threads: true,
        pool: 'threads',
        coverage: { enabled: false },
        poolOptions: {
          threads: {
            maxThreads: 1,
            minThreads: 1,
          },
        },
        maxWorkers: 1,
        singleThread: false,
        maxConcurrency: 1,
        watch: false,
        dir: undefined,
        bail: 1,
        onConsoleLog: sinon.match.func,
      });
    });

    it('should set the NODE_ENV environment variable', async () => {
      delete process.env.NODE_ENV;

      await sut.init();

      expect(process.env.NODE_ENV).to.equal('test');
    });
    it('should set the VITEST environment variable', async () => {
      delete process.env.VITEST;

      await sut.init();

      expect(process.env.VITEST).to.equal('1');
    });
  });

  describe(VitestTestRunner.prototype.dryRun.name, () => {
    beforeEach(async () => {
      await sut.init();
    });

    it('should set related to the mutated files', async () => {
      // Arrange
      vitestStub.config.related = undefined;

      // Act
      await sut.dryRun(
        factory.dryRunOptions({ files: ['src/file.js', 'src/file2.js'] }),
      );

      // Assert
      expect(vitestStub.config.related).deep.equal([
        'src/file.js',
        'src/file2.js',
      ]);
    });

    it('should normalize file paths of related files', async () => {
      // Arrange
      vitestStub.config.related = undefined;

      // Act
      await sut.dryRun(
        factory.dryRunOptions({ files: ['src\\file.js', 'src\\file2.js'] }),
      );

      // Assert
      expect(vitestStub.config.related).deep.equal([
        'src/file.js',
        'src/file2.js',
      ]);
    });

    it('should disable related when `vitest.related` is false', async () => {
      // Arrange
      options.vitest.related = false;
      vitestStub.config.related = ['some', 'file'];

      // Act
      await sut.dryRun(
        factory.dryRunOptions({ files: ['src/file.js', 'src/file2.js'] }),
      );

      // Assert
      expect(vitestStub.config.related).undefined;
    });

    it('should log a warning when `related` is enabled and no files could be found', async () => {
      // Arrange
      const actualError = new Error() as Error & { code: string };
      actualError.code = VITEST_ERROR_CODES.FILES_NOT_FOUND;
      vitestStub.start.rejects(actualError);

      // Act
      await sut.dryRun(factory.dryRunOptions({ files: ['file.js'] }));

      // Assert
      sinon.assert.calledWith(
        testInjector.logger.warn,
        'Vitest failed to find test files related to mutated files. Either disable `vitest.related` or import your source files directly from your test files. See https://stryker-mutator.io/docs/stryker-js/troubleshooting/#vitest-failed-to-find-test-files-related-to-mutated-files',
      );
    });

    it('should not log a warning when `related` is disabled and no files could be found', async () => {
      // Arrange
      const actualError = new Error() as Error & { code: string };
      actualError.code = VITEST_ERROR_CODES.FILES_NOT_FOUND;
      vitestStub.start.rejects(actualError);
      options.vitest.related = false;

      // Act
      await sut.dryRun(factory.dryRunOptions({ files: ['file.js'] }));

      // Assert
      sinon.assert.notCalled(testInjector.logger.warn);
    });
  });

  describe(VitestTestRunner.prototype.mutantRun.name, () => {
    let originalMutationTestTimings: string | undefined;

    beforeEach(async () => {
      originalMutationTestTimings = process.env.STRYKER_MUTATION_TEST_TIMINGS;
      delete process.env.STRYKER_MUTATION_TEST_TIMINGS;
      await sut.init();
    });

    afterEach(() => {
      if (originalMutationTestTimings !== undefined) {
        process.env.STRYKER_MUTATION_TEST_TIMINGS = originalMutationTestTimings;
      } else {
        delete process.env.STRYKER_MUTATION_TEST_TIMINGS;
      }
    });

    it('should include executedTests when mutation timing export is enabled', async () => {
      process.env.STRYKER_MUTATION_TEST_TIMINGS = '1';
      vitestStub.state.getFiles = () => [
        createVitestFile({
          tasks: [
            createVitestTest({
              id: 'file.spec.ts#suite > pass',
              name: 'pass',
              fullName: 'file.spec.ts > suite > pass',
              result: { state: 'pass', duration: 4 },
            }),
            createVitestTest({
              id: 'file.spec.ts#suite > fail',
              name: 'fail',
              fullName: 'file.spec.ts > suite > fail',
              result: {
                state: 'fail',
                duration: 9,
                errors: [{ message: 'boom' }],
              },
            }),
          ],
        }),
      ];

      const result = await sut.mutantRun(factory.mutantRunOptions());

      assertions.expectKilled(result);
      expect(result.executedTests).to.have.length(2);
      expect(result.executedTests?.[0]).deep.include({
        id: 'file.spec.js#suite pass',
        name: 'suite pass',
        status: TestStatus.Success,
        timeSpentMs: 4,
      });
      expect(result.executedTests?.[0]?.fileName).to.match(/file\.spec\.js$/);
      expect(result.executedTests?.[1]).deep.include({
        id: 'file.spec.js#suite fail',
        name: 'suite fail',
        status: TestStatus.Failed,
        timeSpentMs: 9,
      });
      expect(result.executedTests?.[1]?.fileName).to.match(/file\.spec\.js$/);
    });

    it('should not include executedTests when mutation timing export is disabled', async () => {
      vitestStub.state.getFiles = () => [
        createVitestFile({
          tasks: [
            createVitestTest({
              id: 'file.spec.ts#suite > fail',
              name: 'fail',
              fullName: 'file.spec.ts > suite > fail',
              result: {
                state: 'fail',
                duration: 9,
                errors: [{ message: 'boom' }],
              },
            }),
          ],
        }),
      ];

      const result = await sut.mutantRun(factory.mutantRunOptions());

      assertions.expectKilled(result);
      expect(result).not.to.have.property('executedTests');
    });
  });
});
