import sinon from 'sinon';
import { expect } from 'chai';
import { factory, assertions, testInjector, createFakeTick } from '@stryker-mutator/test-helpers';
import { TestStatus, CompleteDryRunResult, DryRunStatus, TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';
import jasmine from 'jasmine';
import { MutantCoverage } from '@stryker-mutator/api/core';
import { Task } from '@stryker-mutator/util';

import * as pluginTokens from '../../src/plugin-tokens.js';
import { helpers } from '../../src/helpers.js';
import { JasmineTestRunner } from '../../src/index.js';
import { expectTestResultsToEqual } from '../helpers/assertions.js';
import { createEnvStub, createJasmineDoneInfo, createSpec, createSpecResult, createJasmineStartedInfo } from '../helpers/mock-factories.js';

describe(JasmineTestRunner.name, () => {
  let reporter: jasmine.CustomReporter;
  let jasmineStub: sinon.SinonStubbedInstance<jasmine>;
  let jasmineEnvStub: sinon.SinonStubbedInstance<jasmine.Env>;
  let sut: JasmineTestRunner;
  let clock: sinon.SinonFakeTimers;
  let fakeTick: ReturnType<typeof createFakeTick>;

  beforeEach(() => {
    jasmineStub = sinon.createStubInstance(jasmine);
    jasmineEnvStub = createEnvStub();
    jasmineStub.env = jasmineEnvStub as unknown as jasmine.Env;
    sinon.stub(helpers, 'createJasmine').returns(jasmineStub);
    clock = sinon.useFakeTimers();
    fakeTick = createFakeTick(clock);
    jasmineEnvStub.addReporter.callsFake((rep: jasmine.CustomReporter) => (reporter = rep));
    testInjector.options.jasmineConfigFile = 'jasmineConfFile';
    sut = testInjector.injector.provideValue(pluginTokens.globalNamespace, '__stryker2__' as const).injectClass(JasmineTestRunner);
  });

  describe('capabilities', () => {
    it('should communicate reloadEnvironment=false', () => {
      const expectedCapabilities: TestRunnerCapabilities = { reloadEnvironment: false };
      expect(sut.capabilities()).deep.eq(expectedCapabilities);
    });
  });

  describe('mutantRun', () => {
    it('should configure jasmine on run', async () => {
      await actEmptyMutantRun();
      expect(jasmineStub.execute).called;
      expect(helpers.createJasmine).calledWith({ projectBaseDir: process.cwd() });
      expect(jasmineStub.loadConfigFile).calledWith('jasmineConfFile');
      expect(jasmineStub.env.configure).calledWith({
        failFast: true,
        stopOnSpecFailure: true,
        oneFailurePerSpec: true,
        autoCleanClosures: false,
        random: false,
        stopSpecOnExpectationFailure: true,
        specFilter: sinon.match.func,
      });
      expect(jasmineStub.exitOnCompletion).eq(false);
      expect(jasmineStub.env.clearReporters).called;
    });

    it('should reuse the jasmine instance when mutantRun is called a second time', async () => {
      await actEmptyMutantRun();
      await actEmptyMutantRun();
      expect(helpers.createJasmine).calledOnce;
      expect(jasmineStub.loadConfigFile).calledOnce;
    });

    it('should filter tests based on testFilter', async () => {
      await actEmptyMutantRun(['1']);
      expect(jasmineEnvStub.configure).calledWithMatch({
        specFilter: sinon.match.func,
      });
      const actualSpecFilter: (spec: jasmine.Spec) => boolean = jasmineEnvStub.configure.getCall(0).args[0].specFilter!;
      expect(actualSpecFilter(createSpec({ id: '1' }))).true;
      expect(actualSpecFilter(createSpec({ id: '2' }))).false;
    });

    it('should not filter tests when testFilter is empty', async () => {
      await actEmptyMutantRun();
      expect(jasmineEnvStub.configure).calledWithMatch({
        specFilter: sinon.match.func,
      });
      const actualSpecFilter: (spec: jasmine.Spec) => boolean = jasmineEnvStub.configure.getCall(0).args[0].specFilter!;
      expect(actualSpecFilter(createSpec({ id: '1' }))).true;
      expect(actualSpecFilter(createSpec({ id: '2' }))).true;
    });

    it("should set the activeMutant on global scope statically when mutantActivation = 'static'", async () => {
      // Arrange
      const executeTask = new Task<jasmine.JasmineDoneInfo>();
      let customReporter: jasmine.CustomReporter | undefined;
      function addReporter(rep: jasmine.CustomReporter) {
        customReporter = rep;
      }
      jasmineEnvStub.addReporter.callsFake(addReporter);
      jasmineStub.execute.returns(executeTask.promise);

      // Act
      const onGoingAct = sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '23' }), mutantActivation: 'static' }));
      await fakeTick();

      // Assert
      expect(global.__stryker2__?.activeMutant).eq('23');
      await customReporter!.jasmineStarted!(createJasmineStartedInfo());
      expect(global.__stryker2__?.activeMutant).eq('23');
      const doneInfo = createJasmineDoneInfo();
      await customReporter!.jasmineDone!(doneInfo);
      executeTask.resolve(doneInfo);
      await onGoingAct;
    });

    it("should set the activeMutant on global scope at runtime when mutantActivation = 'runtime'", async () => {
      // Arrange
      const executeTask = new Task<jasmine.JasmineDoneInfo>();
      let customReporter: jasmine.CustomReporter | undefined;
      function addReporter(rep: jasmine.CustomReporter) {
        customReporter = rep;
      }
      jasmineEnvStub.addReporter.callsFake(addReporter);
      jasmineStub.execute.returns(executeTask.promise);

      // Act
      const onGoingAct = sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '23' }), mutantActivation: 'runtime' }));
      await fakeTick();

      // Assert
      expect(global.__stryker2__?.activeMutant).undefined;
      await customReporter!.jasmineStarted!(createJasmineStartedInfo());
      expect(global.__stryker2__?.activeMutant).eq('23');
      const doneInfo = createJasmineDoneInfo();
      await customReporter!.jasmineDone!(doneInfo);
      executeTask.resolve(doneInfo);
      await onGoingAct;
    });

    function actEmptyMutantRun(testFilter?: string[], activeMutant = factory.mutant(), sandboxFileName = 'sandbox/file') {
      let customReporter: jasmine.CustomReporter;
      function addReporter(rep: jasmine.CustomReporter) {
        customReporter = rep;
      }
      jasmineEnvStub.addReporter.callsFake(addReporter);
      jasmineStub.execute.callsFake(async () => {
        await customReporter.jasmineDone!(createJasmineDoneInfo());
        return createJasmineDoneInfo();
      });
      return sut.mutantRun(factory.mutantRunOptions({ activeMutant, testFilter, timeout: 2000, sandboxFileName }));
    }
  });

  describe('dryRun', () => {
    it('should time spec duration', async () => {
      // Arrange
      clock.setSystemTime(new Date(2010, 1, 1));
      jasmineStub.execute.callsFake(async () => {
        const spec = createSpecResult();
        await reporter.specStarted!(spec);
        clock.tick(10);
        await reporter.specDone!(spec);
        await reporter.jasmineDone!(createJasmineDoneInfo());
        return createJasmineDoneInfo();
      });

      // Act
      const result = await sut.dryRun(factory.dryRunOptions());

      // Assert
      assertions.expectCompleted(result);
      expect(result.tests[0].timeSpentMs).deep.eq(10);
    });

    it('should configure failFast: false when bail is disabled', async () => {
      // Arrange
      jasmineStub.execute.callsFake(async () => {
        await reporter.jasmineDone!(createJasmineDoneInfo());
        return createJasmineDoneInfo();
      });

      // Act
      await sut.dryRun(factory.dryRunOptions({ disableBail: true }));

      // Assert
      expect(jasmineEnvStub.configure).calledWithMatch(sinon.match({ failFast: false, stopOnSpecFailure: false }));
    });

    (['perTest', 'all'] as const).forEach((coverageAnalysis) =>
      it(`should report mutation coverage when coverage analysis is ${coverageAnalysis}`, async () => {
        // Arrange
        const expectedMutationCoverage: MutantCoverage = {
          perTest: {
            '1': { '0': 2, '1': 3 },
          },
          static: {},
        };
        global.__stryker2__!.mutantCoverage = expectedMutationCoverage;
        jasmineStub.execute.callsFake(async () => {
          await reporter.jasmineDone!(createJasmineDoneInfo());
          return createJasmineDoneInfo();
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
      }),
    );

    it('should not report mutation coverage when coverage analysis is "off"', async () => {
      // Arrange
      const expectedMutationCoverage = {
        perTest: {},
        static: {},
      };
      global.__stryker2__!.mutantCoverage = expectedMutationCoverage;
      jasmineStub.execute.callsFake(async () => {
        await reporter.jasmineDone!(createJasmineDoneInfo());
        return createJasmineDoneInfo();
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
      jasmineStub.execute.callsFake(async () => {
        const spec0 = createSpecResult({ id: 'spec0' });
        const spec1 = createSpecResult({ id: 'spec23' });
        await reporter.specStarted!(spec0);
        firstCurrentTestId = global.__stryker2__!.currentTestId;
        await reporter.specDone!(spec0);
        await reporter.specStarted!(spec1);
        secondCurrentTestId = global.__stryker2__!.currentTestId;
        await reporter.specDone!(spec1);
        await reporter.jasmineDone!(createJasmineDoneInfo());
        return createJasmineDoneInfo();
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
      jasmineStub.execute.callsFake(async () => {
        const spec0 = createSpecResult({ id: 'spec0' });
        await reporter.specStarted!(spec0);
        firstCurrentTestId = global.__stryker2__!.currentTestId;
        await reporter.specDone!(spec0);
        await reporter.jasmineDone!(createJasmineDoneInfo());
        return createJasmineDoneInfo();
      });

      // Act
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));

      // Assert
      expect(firstCurrentTestId).undefined;
    });

    it('should report completed specs', async () => {
      // Arrange
      jasmineStub.execute.callsFake(async () => {
        await reporter.specDone!(createSpecResult({ id: 'spec0', fullName: 'foo spec', status: 'success', description: 'string' }));
        await reporter.specDone!(
          createSpecResult({
            id: 'spec1',
            fullName: 'bar spec',
            status: 'failure',
            failedExpectations: [{ actual: 'foo', expected: 'bar', matcherName: 'fooMatcher', passed: false, message: 'bar failed', stack: 'stack' }],
            description: 'string',
          }),
        );
        await reporter.specDone!(createSpecResult({ id: 'spec2', fullName: 'disabled', status: 'disabled', description: 'string' }));
        await reporter.specDone!(createSpecResult({ id: 'spec3', fullName: 'pending', status: 'pending', description: 'string' }));
        await reporter.specDone!(createSpecResult({ id: 'spec4', fullName: 'excluded', status: 'excluded', description: 'string' }));
        await reporter.jasmineDone!(createJasmineDoneInfo());
        return createJasmineDoneInfo();
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
        .matches(/An error occurred.*/)
        .and.matches(/.*Error: foobar.*/);
    });

    it('should throw when the reporter doesn\'t report "jasmineDone"', async () => {
      jasmineStub.execute.resolves(createJasmineDoneInfo());

      // Act
      const actualResult = await sut.dryRun(factory.dryRunOptions());

      // Assert
      assertions.expectErrored(actualResult);
      expect(actualResult.errorMessage).contains('Jasmine reporter didn\'t report "jasmineDone", this shouldn\'t happen');
    });
  });
});
