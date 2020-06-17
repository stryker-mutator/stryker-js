import * as sinon from 'sinon';
import { expect } from 'chai';
import { factory, assertions } from '@stryker-mutator/test-helpers';
import { TestStatus, CompleteDryRunResult, RunStatus } from '@stryker-mutator/api/test_runner2';

import * as helpers from '../../src/helpers';
import JasmineTestRunner from '../../src/JasmineTestRunner';
import { expectTestResultsToEqual } from '../helpers/assertions';
import { createEnvStub, createRunDetails, createCustomReporterResult } from '../helpers/mockFactories';

import Jasmine = require('jasmine');

type SinonStubbedInstance<TType> = {
  [P in keyof TType]: TType[P] extends Function ? sinon.SinonStub : TType[P];
};

describe(JasmineTestRunner.name, () => {
  let reporter: jasmine.CustomReporter;
  let jasmineStub: SinonStubbedInstance<Jasmine>;
  let jasmineEnvStub: SinonStubbedInstance<jasmine.Env>;
  let sut: JasmineTestRunner;
  let fileNames: string[];
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    jasmineStub = sinon.createStubInstance(Jasmine);
    jasmineEnvStub = createEnvStub();
    jasmineStub.env = (jasmineEnvStub as unknown) as jasmine.Env;
    sinon.stub(helpers, 'Jasmine').returns(jasmineStub);
    fileNames = ['foo.js', 'bar.js'];
    clock = sinon.useFakeTimers();
    jasmineEnvStub.addReporter.callsFake((rep: jasmine.CustomReporter) => (reporter = rep));
    sut = new JasmineTestRunner(fileNames, factory.strykerOptions({ jasmineConfigFile: 'jasmineConfFile' }));
  });

  afterEach(() => {
    delete require.cache['foo.js'];
    delete require.cache['bar.js'];
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

    it('should clear require cache on run', async () => {
      require.cache['foo.js'] = 'foo' as any;
      require.cache['bar.js'] = 'bar' as any;
      await actEmptyMutantRun();
      expect(require.cache['foo.js']).not.ok;
      expect(require.cache['bar.js']).not.ok;
    });

    it('should filter tests based on testFilter', async () => {
      await actEmptyMutantRun(['1']);
      expect(jasmineEnvStub.configure).calledWithMatch({
        specFilter: sinon.match.func,
      });
      const actualSpecFilter: (spec: Pick<jasmine.Spec, 'id'>) => boolean = jasmineEnvStub.configure.getCall(0).args[0].specFilter;
      expect(actualSpecFilter({ id: 1 })).true;
      expect(actualSpecFilter({ id: 2 })).false;
    });

    it('should set the __activeMutant__ on global scope', async () => {
      actEmptyMutantRun(undefined, factory.mutant({ id: 23 }));
      expect(global.__activeMutant__).eq(23);
    });

    function actEmptyMutantRun(testFilter?: string[], activeMutant = factory.mutant()) {
      let reporter: jasmine.CustomReporter;
      function addReporter(rep: jasmine.CustomReporter) {
        reporter = rep;
      }
      jasmineEnvStub.addReporter.callsFake(addReporter);
      jasmineStub.execute.callsFake(() => reporter.jasmineDone!(createRunDetails()));
      return sut.mutantRun({ activeMutant, testFilter, timeout: 2000 });
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
        global.__mutantCoverage__ = expectedMutationCoverage;
        jasmineStub.execute.callsFake(() => {
          reporter.jasmineDone!(createRunDetails());
        });

        // Act
        const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis }));

        // Assert
        const expectedResult: CompleteDryRunResult = {
          status: RunStatus.Complete,
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
      global.__mutantCoverage__ = expectedMutationCoverage;
      jasmineStub.execute.callsFake(() => {
        reporter.jasmineDone!(createRunDetails());
      });

      // Act
      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));

      // Assert
      const expectedResult: CompleteDryRunResult = {
        status: RunStatus.Complete,
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
        firstCurrentTestId = global.__currentTestId__;
        reporter.specDone!(spec0);
        reporter.specStarted!(spec1);
        secondCurrentTestId = global.__currentTestId__;
        reporter.specDone!(spec1);
        reporter.jasmineDone!(createRunDetails());
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
        firstCurrentTestId = global.__currentTestId__;
        reporter.specDone!(spec0);
        reporter.jasmineDone!(createRunDetails());
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
