import { RunStatus, TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import Jasmine = require('jasmine');

import * as helpers from '../../src/helpers';
import JasmineTestRunner from '../../src/JasmineTestRunner';
import { expectTestResultsToEqual } from '../helpers/assertions';
import { createEnvStub, createRunDetails } from '../helpers/mockFactories';

type SinonStubbedInstance<TType> = {
  [P in keyof TType]: TType[P] extends Function ? sinon.SinonStub : TType[P];
};

describe.only('JasmineTestRunner', () => {
  let jasmineStub: SinonStubbedInstance<Jasmine>;
  let jasmineEnvStub: SinonStubbedInstance<jasmine.Env>;
  let evalGlobalStub: sinon.SinonStub;
  let sut: JasmineTestRunner;
  let fileNames: string[];
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    jasmineStub = sinon.createStubInstance(Jasmine);
    jasmineEnvStub = createEnvStub();
    jasmineStub.env = (jasmineEnvStub as unknown) as jasmine.Env;
    evalGlobalStub = sinon.stub(helpers, 'evalGlobal');
    sinon.stub(helpers, 'Jasmine').returns(jasmineStub);
    fileNames = ['foo.js', 'bar.js'];
    clock = sinon.useFakeTimers();
    sut = new JasmineTestRunner(fileNames, factory.strykerOptions({ jasmineConfigFile: 'jasmineConfFile' }));
  });

  afterEach(() => {
    delete require.cache['foo.js'];
    delete require.cache['bar.js'];
    sinon.restore();
  });

  it('should configure jasmine on run', async () => {
    await actRunWithoutTests();
    expect(jasmineStub.execute).called;
    expect(helpers.Jasmine).calledWithNew;
    expect(helpers.Jasmine).calledWith({ projectBaseDir: process.cwd() });
    expect(jasmineStub.loadConfigFile).calledWith('jasmineConfFile');
    expect(jasmineStub.env.configure).calledWith({
      failFast: true,
      oneFailurePerSpec: true,
    });
    expect(jasmineStub.exit.toString()).eq('() => { }');
    expect(jasmineStub.env.clearReporters).called;
    expect(jasmineStub.randomizeTests).calledWith(false);
  });

  it('should clear require cache on run', async () => {
    require.cache['foo.js'] = 'foo' as any;
    require.cache['bar.js'] = 'bar' as any;
    await actRunWithoutTests();
    expect(require.cache['foo.js']).not.ok;
    expect(require.cache['bar.js']).not.ok;
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
    const result = await sut.run({});

    // Assert
    expect(result.status).eq(RunStatus.Complete);
    expectTestResultsToEqual(result.tests, [
      { name: 'foo spec', status: TestStatus.Success, failureMessages: undefined },
      { name: 'bar spec', status: TestStatus.Failed, failureMessages: ['bar failed'] },
      { name: 'disabled', status: TestStatus.Skipped, failureMessages: undefined },
      { name: 'pending', status: TestStatus.Skipped, failureMessages: undefined },
      { name: 'excluded', status: TestStatus.Skipped, failureMessages: undefined },
    ]);
  });

  it('should time spec duration', async () => {
    function addReporter(rep: jasmine.CustomReporter) {
      const spec = { fullName: 'foobar spec', id: 'spec0', description: '' };
      rep.specStarted!(spec);
      clock.tick(10);
      rep.specDone!(spec);
      rep.jasmineDone!(createRunDetails());
    }
    jasmineEnvStub.addReporter.callsFake(addReporter);
    const result = await sut.run({});
    const expectedTestResult: TestResult = {
      failureMessages: undefined,
      name: 'foobar spec',
      status: TestStatus.Success,
      timeSpentMs: 10,
    };
    expect(result.tests).deep.eq([expectedTestResult]);
  });

  it('should report errors on run', async () => {
    const error = new Error('foobar');
    jasmineStub.execute.throws(error);
    const result = await sut.run({});
    expect(result.status).eq(RunStatus.Error);
    expect(result.errorMessages).lengthOf(1);
    expect((result.errorMessages || [])[0])
      .matches(/An error occurred while loading your jasmine specs.*/)
      .and.matches(/.*Error: foobar.*/);
  });

  it('should evaluate testHooks in global context', async () => {
    const hooks = 'foobar';
    await actRunWithoutTests(hooks);
    expect(evalGlobalStub).calledWith(hooks);
  });

  function actRunWithoutTests(testHooks?: string) {
    function addReporter(rep: jasmine.CustomReporter) {
      rep.jasmineDone!(createRunDetails());
    }
    jasmineEnvStub.addReporter.callsFake(addReporter);
    return sut.run({ testHooks });
  }
});
