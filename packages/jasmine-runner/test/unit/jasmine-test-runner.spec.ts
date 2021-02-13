import { CompleteDryRunResult, DryRunStatus, TestStatus } from '@stryker-mutator/api/test-runner';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { DirectoryRequireCache } from '@stryker-mutator/util';
import { expect } from 'chai';
import Jasmine from 'jasmine';
import sinon from 'sinon';

import { JasmineTestRunner } from '../../src';
import * as helpers from '../../src/helpers';
import * as pluginTokens from '../../src/plugin-tokens';
import { expectTestResultsToEqual } from '../helpers/assertions';
import { createCustomReporterResult, createEnvStub, createRunDetails } from '../helpers/mock-factories';

describe(JasmineTestRunner.name, () => {
  let reporter: jasmine.CustomReporter;
  let jasmineStub: sinon.SinonStubbedInstance<Jasmine>;
  let jasmineEnvStub: sinon.SinonStubbedInstance<jasmine.Env>;
  let directoryRequireCacheMock: sinon.SinonStubbedInstance<DirectoryRequireCache>;
  let sut: JasmineTestRunner;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    jasmineStub = sinon.createStubInstance(Jasmine);
    jasmineEnvStub = createEnvStub();
    jasmineStub.env = (jasmineEnvStub as unknown) as jasmine.Env;
    sinon.stub(helpers, 'Jasmine').returns(jasmineStub);
    clock = sinon.useFakeTimers();
    directoryRequireCacheMock = sinon.createStubInstance(DirectoryRequireCache);
    jasmineEnvStub.addReporter.callsFake((rep: jasmine.CustomReporter) => (reporter = rep));
    testInjector.options.jasmineConfigFile = 'jasmineConfFile';
    sut = testInjector.injector
      .provideValue(pluginTokens.directoryRequireCache, directoryRequireCacheMock)
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(JasmineTestRunner);
  });

  describe('mutantRun', () => {
    it('should configure jasmine on run', async () => {
      await actEmptyMutantRun();
      expect(jasmineStub.execute).called;
      expect(helpers.Jasmine).calledWithNew;
      expect(helpers.Jasmine).calledWith({ projectBaseDir: process.cwd() });
      expect(jasmineStub.loadConfigFile).calledWith('jasmineConfFile');
      expect(jasmineStub.env.configure).calledWith({
        failFast: true,
        oneFailurePerSpec: true,
        specFilter: undefined,
      });
      expect(jasmineStub.exit).ok.and.not.eq(process.exit);
      expect(jasmineStub.env.clearReporters).called;
      expect(jasmineStub.randomizeTests).calledWith(false);
    });

    it('should clear require cache for each run', async () => {
      await actEmptyMutantRun();
      expect(directoryRequireCacheMock.clear).called;
      expect(directoryRequireCacheMock.record).called;
      expect(directoryRequireCacheMock.clear).calledBefore(directoryRequireCacheMock.record);
    });

    it('should filter tests based on testFilter', async () => {
      await actEmptyMutantRun(['1']);
      expect(jasmineEnvStub.configure).calledWithMatch({
        specFilter: sinon.match.func,
      });
      const actualSpecFilter: (spec: jasmine.Spec) => boolean = jasmineEnvStub.configure.getCall(0).args[0].specFilter!;
      expect(actualSpecFilter({ id: '1' } as jasmine.Spec)).true;
      expect(actualSpecFilter({ id: '2' } as jasmine.Spec)).false;
    });

    it('should set the activeMutant on global scope', async () => {
      actEmptyMutantRun(undefined, factory.mutant({ id: 23 }));
      expect(global.__stryker2__?.activeMutant).eq(23);
    });

    function actEmptyMutantRun(testFilter?: string[], activeMutant = factory.mutant(), sandboxFileName = 'sandbox/file') {
      let customReporter: jasmine.CustomReporter;
      function addReporter(rep: jasmine.CustomReporter) {
        customReporter = rep;
      }
      jasmineEnvStub.addReporter.callsFake(addReporter);
      jasmineStub.execute.callsFake(async () => customReporter.jasmineDone!(createRunDetails()));
      return sut.mutantRun({ activeMutant, testFilter, timeout: 2000, sandboxFileName });
    }
  });

  describe('dryRun', () => {
    it('should time spec duration', async () => {
      // Arrange
      clock.setSystemTime(new Date(2010, 1, 1));
      jasmineStub.execute.callsFake(() => {
        const spec = createCustomReporterResult();
        reporter.specStarted!(spec);
        clock.tick(10);
        reporter.specDone!(spec);
        reporter.jasmineDone!(createRunDetails());
        return undefined;
      });

      // Act
      const result = await sut.dryRun(factory.dryRunOptions());

      // Assert
      assertions.expectCompleted(result);
      expect(result.tests[0].timeSpentMs).deep.eq(10);
    });

    (['perTest', 'all'] as const).forEach((coverageAnalysis) =>
      it(`should report mutation coverage when coverage analysis is ${coverageAnalysis}`, async () => {
        // Arrange
        const expectedMutationCoverage = {
          perTest: {
            [1]: [2, 3],
          },
          static: {},
        };
        global.__stryker2__!.mutantCoverage = expectedMutationCoverage;
        jasmineStub.execute.callsFake(() => {
          reporter.jasmineDone!(createRunDetails());
          return undefined;
        });

        // Act
        const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis }));

        // Assert
        const expectedResult: CompleteDryRunResult = {
          status: DryRunStatus.Complete,
          tests: [],
          mutantCoverage: expectedMutationCoverage,
        };
        expect(result).deep.eq(expectedResult);
      })
    );

    it('should not report mutation coverage when coverage analysis is "off"', async () => {
      // Arrange
      const expectedMutationCoverage = {
        perTest: {},
        static: {},
      };
      global.__stryker2__!.mutantCoverage = expectedMutationCoverage;
      jasmineStub.execute.callsFake(() => {
        reporter.jasmineDone!(createRunDetails());
        return undefined;
      });

      // Act
      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));

      // Assert
      const expectedResult: CompleteDryRunResult = {
        status: DryRunStatus.Complete,
        tests: [],
        mutantCoverage: undefined,
      };
      expect(result).deep.eq(expectedResult);
    });

    it('set current test id between specs when coverageAnalysis = "perTest"', async () => {
      // Arrange
      let firstCurrentTestId: string | undefined;
      let secondCurrentTestId: string | undefined;
      jasmineStub.execute.callsFake(() => {
        const spec0 = createCustomReporterResult({ id: 'spec0' });
        const spec1 = createCustomReporterResult({ id: 'spec23' });
        reporter.specStarted!(spec0);
        firstCurrentTestId = global.__stryker2__!.currentTestId;
        reporter.specDone!(spec0);
        reporter.specStarted!(spec1);
        secondCurrentTestId = global.__stryker2__!.currentTestId;
        reporter.specDone!(spec1);
        reporter.jasmineDone!(createRunDetails());
        return undefined;
      });

      // Act
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));

      // Assert
      expect(firstCurrentTestId).eq('spec0');
      expect(secondCurrentTestId).eq('spec23');
    });

    it('not set current test id between specs when coverageAnalysis = "all"', async () => {
      // Arrange
      let firstCurrentTestId: string | undefined;
      jasmineStub.execute.callsFake(() => {
        const spec0 = createCustomReporterResult({ id: 'spec0' });
        reporter.specStarted!(spec0);
        firstCurrentTestId = global.__stryker2__!.currentTestId;
        reporter.specDone!(spec0);
        reporter.jasmineDone!(createRunDetails());
        return undefined;
      });

      // Act
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));

      // Assert
      expect(firstCurrentTestId).undefined;
    });

    it('should report completed specs', async () => {
      // Arrange
      jasmineStub.execute.callsFake(() => {
        reporter.specDone!({ id: 'spec0', fullName: 'foo spec', status: 'success', description: 'string' });
        reporter.specDone!({
          id: 'spec1',
          fullName: 'bar spec',
          status: 'failure',
          failedExpectations: [{ actual: 'foo', expected: 'bar', matcherName: 'fooMatcher', passed: false, message: 'bar failed', stack: 'stack' }],
          description: 'string',
        });
        reporter.specDone!({ id: 'spec2', fullName: 'disabled', status: 'disabled', description: 'string' });
        reporter.specDone!({ id: 'spec3', fullName: 'pending', status: 'pending', description: 'string' });
        reporter.specDone!({ id: 'spec4', fullName: 'excluded', status: 'excluded', description: 'string' });
        reporter.jasmineDone!(createRunDetails());
        return undefined;
      });

      // Act
      const result = await sut.dryRun(factory.dryRunOptions());

      // Assert
      assertions.expectCompleted(result);
      expectTestResultsToEqual(result.tests, [
        { id: 'spec0', name: 'foo spec', status: TestStatus.Success },
        { id: 'spec1', name: 'bar spec', status: TestStatus.Failed, failureMessage: 'bar failed' },
        { id: 'spec2', name: 'disabled', status: TestStatus.Skipped },
        { id: 'spec3', name: 'pending', status: TestStatus.Skipped },
        { id: 'spec4', name: 'excluded', status: TestStatus.Skipped },
      ]);
    });

    it('should report errors on run', async () => {
      const error = new Error('foobar');
      jasmineStub.execute.throws(error);
      const result = await sut.dryRun(factory.dryRunOptions());
      assertions.expectErrored(result);
      expect(result.errorMessage)
        .matches(/An error occurred while loading your jasmine specs.*/)
        .and.matches(/.*Error: foobar.*/);
    });
  });
});
