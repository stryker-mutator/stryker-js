import sinon from 'sinon';
import { expect } from 'chai';
import fs from 'fs';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import {
  MutantRunStatus,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import { Vitest } from 'vitest/node';

import { VitestTestRunner } from '../../src/vitest-test-runner.js';
import { VitestRunnerOptionsWithStrykerOptions } from '../../src/vitest-runner-options-with-stryker-options.js';
import { vitestWrapper } from '../../src/vitest-wrapper.js';
import { createVitestMock } from '../util/factories.js';
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
    const assertCommonVitestOptions = () => {
      sinon.assert.calledOnce(createVitestStub);
      expect(createVitestStub.firstCall.args[0]).to.equal('test');
      const vitestOptions = createVitestStub.firstCall.args[1];
      expect(vitestOptions).deep.include({
        config: undefined,
        coverage: { enabled: false },
        maxConcurrency: 1,
        watch: false,
        dir: undefined,
        bail: 1,
      });
      expect(vitestOptions.onConsoleLog).to.be.a('function');
      return vitestOptions;
    };

    it('should initialize the vitest environment for vitest <1.0.0', async () => {
      sinon.replace(vitestWrapper, 'version', '0.9.0');
      await sut.init();
      const vitestOptions = assertCommonVitestOptions();
      expect(vitestOptions).deep.include({
        threads: true,
        maxThreads: 1,
        minThreads: 1,
      });
    });

    it('should initialize the vitest environment for vitest >=1.0.0 <4.1.0', async () => {
      sinon.replace(vitestWrapper, 'version', '2.0.0');
      await sut.init();
      const vitestOptions = assertCommonVitestOptions();
      expect(vitestOptions).deep.include({
        pool: 'threads',
        poolOptions: {
          threads: {
            maxThreads: 1,
            minThreads: 1,
          },
        },
      });
    });

    it('should initialize the vitest environment for vitest >=4.1.0', async () => {
      sinon.replace(vitestWrapper, 'version', '4.1.0');
      await sut.init();
      const vitestOptions = assertCommonVitestOptions();
      expect(vitestOptions).deep.include({
        pool: 'threads',
        maxWorkers: 1,
      });
    });

    it('should initialize the vitest environment for a prerelease version beyond 4.1.0', async () => {
      sinon.replace(vitestWrapper, 'version', '5.0.0-beta.1');
      await sut.init();
      const vitestOptions = assertCommonVitestOptions();
      expect(vitestOptions).deep.include({
        pool: 'threads',
        maxWorkers: 1,
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

  describe(VitestTestRunner.prototype.mutantRun.name, () => {
    beforeEach(async () => {
      await sut.init();
    });

    it('should return survived when no tests fail', async () => {
      const result = await sut.mutantRun(factory.mutantRunOptions());
      expect(result.status).to.equal(MutantRunStatus.Survived);
    });

    it('should provide the active mutant to vitest context', async () => {
      const options = factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '42' }),
      });
      await sut.mutantRun(options);
      sinon.assert.calledWith(
        vitestStub.provide as sinon.SinonStub,
        'activeMutant',
        '42',
      );
      sinon.assert.calledWith(
        vitestStub.provide as sinon.SinonStub,
        'mode',
        'mutant',
      );
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
});
