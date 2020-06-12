import * as sinon from 'sinon';
import { expect } from 'chai';
import { factory } from '@stryker-mutator/test-helpers';
import { TestResult } from '@stryker-mutator/api/test_runner2';
import { TestStatus } from '@stryker-mutator/api/test_runner';

import Jasmine = require('jasmine');
import * as helpers from '../../src/helpers';
import JasmineTestRunner from '../../src/JasmineTestRunner';
import { expectTestResultsToEqual, expectCompleted, expectErrored } from '../helpers/assertions';
import { createEnvStub, createRunDetails } from '../helpers/mockFactories';

type SinonStubbedInstance<TType> = {
  [P in keyof TType]: TType[P] extends Function ? sinon.SinonStub : TType[P];
};

describe(JasmineTestRunner.name, () => {
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
    sut = new JasmineTestRunner(fileNames, factory.strykerOptions({ jasmineConfigFile: 'jasmineConfFile' }));
  });

  afterEach(() => {
    delete require.cache['foo.js'];
    delete require.cache['bar.js'];
    delete global.__activeMutant__;
    sinon.restore();
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
      function addReporter(rep: jasmine.CustomReporter) {
        const spec = { fullName: 'foobar spec', id: 'spec0', description: '' };
        rep.specStarted!(spec);
        clock.tick(10);
        rep.specDone!(spec);
        rep.jasmineDone!(createRunDetails());
      }
      jasmineEnvStub.addReporter.callsFake(addReporter);
      const result = await sut.dryRun(factory.dryRunOptions());
      expectCompleted(result);
      const expectedTestResult: TestResult = {
        id: 'spec0',
        name: 'foobar spec',
        status: TestStatus.Success,
        timeSpentMs: 10,
      };
      expect(result.tests).deep.eq([expectedTestResult]);
    });

    it('should report completed specs', async () => {
      // Arrange
      function addReporter(rep: jasmine.CustomReporter) {
        rep.specDone!({ id: 'spec0', fullName: 'foo spec', status: 'success', description: 'string' });
        rep.specDone!({
          id: 'spec1',
          fullName: 'bar spec',
          status: 'failure',
          failedExpectations: [{ actual: 'foo', expected: 'bar', matcherName: 'fooMatcher', passed: false, message: 'bar failed', stack: 'stack' }],
          description: 'string',
        });
        rep.specDone!({ id: 'spec2', fullName: 'disabled', status: 'disabled', description: 'string' });
        rep.specDone!({ id: 'spec3', fullName: 'pending', status: 'pending', description: 'string' });
        rep.specDone!({ id: 'spec4', fullName: 'excluded', status: 'excluded', description: 'string' });
        rep.jasmineDone!(createRunDetails());
      }
      jasmineEnvStub.addReporter.callsFake(addReporter);

      // Act
      const result = await sut.dryRun(factory.dryRunOptions());

      // Assert
      expectCompleted(result);
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
      expectErrored(result);
      expect(result.errorMessage)
        .matches(/An error occurred while loading your jasmine specs.*/)
        .and.matches(/.*Error: foobar.*/);
    });
  });
});
