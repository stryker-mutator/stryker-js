import { RunResult, RunStatus, TestStatus } from '@stryker-mutator/api/test_runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { steps } from 'web-component-tester';
import * as wctModule from 'web-component-tester';
import * as contextModule from 'web-component-tester/runner/context';

import { WctLogger } from '../../src/WctLogger';
import { WctReporter } from '../../src/WctReporter';
import * as wctLoggerModule from '../../src/WctLogger';
import * as wctReporterModule from '../../src/WctReporter';
import { WctTestRunner } from '../../src/WctTestRunner';

describe(WctTestRunner.name, () => {
  let contextMock: sinon.SinonStubbedInstance<contextModule.Context>;
  let wctLoggerMock: sinon.SinonStubbedInstance<WctLogger>;
  let wctReporterMock: sinon.SinonStubbedInstance<WctReporter>;
  let stepsMock: sinon.SinonStubbedInstance<typeof steps>;

  function createSut(): WctTestRunner {
    return testInjector.injector.injectClass(WctTestRunner);
  }

  beforeEach(() => {
    contextMock = sinon.createStubInstance(contextModule.Context);
    stepsMock = {
      cancelTests: sinon.stub(),
      configure: sinon.stub(),
      loadPlugins: sinon.stub(),
      prepare: sinon.stub(),
      runTests: sinon.stub(),
      setupOverrides: sinon.stub(),
    };
    testInjector.options.coverageAnalysis = 'off';
    contextMock.options = {};
    wctLoggerMock = sinon.createStubInstance(WctLogger);
    wctReporterMock = sinon.createStubInstance(WctReporter);
    sinon.stub(contextModule, 'Context').returns(contextMock);
    sinon.stub(wctLoggerModule, 'WctLogger').returns(wctLoggerMock);
    sinon.stub(wctReporterModule, 'WctReporter').returns(wctReporterMock);
    sinon.stub(wctModule, 'steps').value(stepsMock);
  });

  it('should create a context using wct options, with `persistent = false`', () => {
    const wctOptions = { foo: 'bar', persistent: true };
    const expectedWctOptions = { foo: 'bar', persistent: false };
    testInjector.options.wct = wctOptions;
    createSut();
    expect(contextModule.Context).calledWithNew;
    expect(contextModule.Context).calledWith(expectedWctOptions);
  });

  it('should create a reporter', () => {
    createSut();
    expect(wctReporterModule.WctReporter).calledWithNew;
    expect(wctReporterModule.WctReporter).calledWith(contextMock);
  });

  it('should create a logger', () => {
    contextMock.options.verbose = true;
    createSut();
    expect(wctLoggerModule.WctLogger).calledWithNew;
    expect(wctLoggerModule.WctLogger).calledWith(contextMock, true);
  });

  it('should throw when coverageAnalysis != "off"', () => {
    testInjector.options.coverageAnalysis = 'all';
    const expectedError =
      'Coverage analysis "all" is not (yet) supported by the WCT test runner plugin. Please set `coverageAnalysis: "off"` in your config file.';
    expect(() => createSut()).throws(expectedError);
  });

  describe('init', () => {
    it('should run initialization steps', async () => {
      const sut = createSut();
      await sut.init();
      expect(stepsMock.setupOverrides).calledBefore(stepsMock.loadPlugins);
      expect(stepsMock.loadPlugins).calledBefore(stepsMock.configure);
      expect(stepsMock.configure).calledBefore(stepsMock.prepare);
      expect(stepsMock.setupOverrides).calledWith(contextMock);
      expect(stepsMock.loadPlugins).calledWith(contextMock);
      expect(stepsMock.configure).calledWith(contextMock);
      expect(stepsMock.prepare).calledWith(contextMock);
    });
  });

  describe('dispose', () => {
    it('should run dispose the logger and reporter', () => {
      const sut = createSut();
      sut.dispose();
      expect(wctLoggerMock.dispose).called;
      expect(wctReporterMock.dispose).called;
    });
  });

  describe('run', () => {
    it('should run clear tests', async () => {
      stepsMock.runTests.resolves();
      const sut = createSut();
      wctReporterMock.results = [{ name: 'foobar', status: TestStatus.Success, timeSpentMs: 4 }];
      const actual = await sut.run();
      const expectedRunResult: RunResult = { status: RunStatus.Complete, tests: [] };
      expect(actual).deep.eq(expectedRunResult);
    });

    it('should run tests', async () => {
      stepsMock.runTests.resolves();
      const sut = createSut();
      const runPromise = sut.run();
      const expectedTests = (wctReporterMock.results = [{ name: 'foobar', status: TestStatus.Success, timeSpentMs: 4 }]);
      const actual = await runPromise;
      const expectedRunResult: RunResult = { status: RunStatus.Complete, tests: expectedTests };
      expect(actual).deep.eq(expectedRunResult);
    });

    it('should ignore errors from failed tests', async () => {
      stepsMock.runTests.rejects(new Error('23 failed tests'));
      const sut = createSut();
      const runPromise = sut.run();
      const expectedTests = (wctReporterMock.results = [{ name: 'foobar', status: TestStatus.Failed, timeSpentMs: 4 }]);
      const actual = await runPromise;
      const expectedRunResult: RunResult = { status: RunStatus.Complete, tests: expectedTests };
      expect(actual).deep.eq(expectedRunResult);
    });

    it('should not ignore other errors', async () => {
      const expectedError = new Error('Foobar Error');
      stepsMock.runTests.rejects(expectedError);
      const sut = createSut();
      const actualResult = await sut.run();
      expect(actualResult.status).eq(RunStatus.Error);
      expect(actualResult.errorMessages).deep.eq([expectedError.stack]);
    });
  });
});
