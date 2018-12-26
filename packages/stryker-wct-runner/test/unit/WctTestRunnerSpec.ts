import { expect } from 'chai';
import * as sinon from 'sinon';
import { StrykerOptions } from 'stryker-api/core';
import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import { steps } from 'web-component-tester';
import * as wctModule from 'web-component-tester';
import * as contextModule from 'web-component-tester/runner/context';
import WctLogger, * as wctLoggerModule from '../../src/WctLogger';
import WctReporter, * as wctReporterModule from '../../src/WctReporter';
import WctTestRunner from '../../src/WctTestRunner';

describe(WctTestRunner.name, () => {

  let contextMock: sinon.SinonStubbedInstance<contextModule.Context>;
  let wctLoggerMock: sinon.SinonStubbedInstance<WctLogger>;
  let wctReporterMock: sinon.SinonStubbedInstance<WctReporter>;
  let stepsMock: sinon.SinonStubbedInstance<typeof steps>;
  let options: { strykerOptions: StrykerOptions };

  beforeEach(() => {
    contextMock = sinon.createStubInstance(contextModule.Context);
    stepsMock = {
      cancelTests: sinon.stub(),
      configure: sinon.stub(),
      loadPlugins: sinon.stub(),
      prepare: sinon.stub(),
      runTests: sinon.stub(),
      setupOverrides: sinon.stub()
    };
    options = { strykerOptions: { coverageAnalysis: 'off' } };
    contextMock.options = {};
    wctLoggerMock = sinon.createStubInstance(WctLogger);
    wctReporterMock = sinon.createStubInstance(WctReporter);
    sinon.stub(contextModule, 'Context').returns(contextMock);
    sinon.stub(wctLoggerModule, 'default').returns(wctLoggerMock);
    sinon.stub(wctReporterModule, 'default').returns(wctReporterMock);
    sinon.stub(wctModule, 'steps').value(stepsMock);
  });

  it('should create a context using wct options, with `persistent = false`', () => {
    const wctOptions = { foo: 'bar', persistent: true };
    const expectedWctOptions = { foo: 'bar', persistent: false };
    options.strykerOptions.wct = wctOptions;
    new WctTestRunner(options);
    expect(contextModule.Context).calledWithNew;
    expect(contextModule.Context).calledWith(expectedWctOptions);
  });

  it('should create a reporter', () => {
    new WctTestRunner(options);
    expect(wctReporterModule.default).calledWithNew;
    expect(wctReporterModule.default).calledWith(contextMock);
  });

  it('should create a logger', () => {
    contextMock.options.verbose = true;
    new WctTestRunner(options);
    expect(wctLoggerModule.default).calledWithNew;
    expect(wctLoggerModule.default).calledWith(contextMock, true);
  });

  it('should throw when coverageAnalysis != "off"', () => {
    options.strykerOptions.coverageAnalysis = 'all';
    const expectedError = 'Coverage analysis "all" is not (yet) supported by the WCT test runner plugin. Please set `coverageAnalysis: "off"` in your stryker.conf.js file.';
    expect(() => new WctTestRunner(options)).throws(expectedError);
  });

  describe('init', () => {
    it('should run initialization steps', async () => {
      const sut = new WctTestRunner(options);
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
      const sut = new WctTestRunner(options);
      sut.dispose();
      expect(wctLoggerMock.dispose).called;
      expect(wctReporterMock.dispose).called;
    });
  });

  describe('run', () => {

    it('should run clear tests', async () => {
      stepsMock.runTests.resolves();
      const sut = new WctTestRunner(options);
      wctReporterMock.results = [{ name: 'foobar', status: TestStatus.Success, timeSpentMs: 4 }];
      const actual = await sut.run();
      const expectedRunResult: RunResult = { status: RunStatus.Complete, tests: [] };
      expect(actual).deep.eq(expectedRunResult);
    });

    it('should run tests', async () => {
      stepsMock.runTests.resolves();
      const sut = new WctTestRunner(options);
      const runPromise = sut.run();
      const expectedTests = wctReporterMock.results = [{ name: 'foobar', status: TestStatus.Success, timeSpentMs: 4 }];
      const actual = await runPromise;
      const expectedRunResult: RunResult = { status: RunStatus.Complete, tests: expectedTests };
      expect(actual).deep.eq(expectedRunResult);
    });

    it('should ignore errors from failed tests', async () => {
      stepsMock.runTests.rejects(new Error('23 failed tests'));
      const sut = new WctTestRunner(options);
      const runPromise = sut.run();
      const expectedTests = wctReporterMock.results = [{ name: 'foobar', status: TestStatus.Failed, timeSpentMs: 4 }];
      const actual = await runPromise;
      const expectedRunResult: RunResult = { status: RunStatus.Complete, tests: expectedTests };
      expect(actual).deep.eq(expectedRunResult);
    });

    it('should not ignore other errors', async () => {
      const expectedError = new Error('Foobar Error');
      stepsMock.runTests.rejects(expectedError);
      const sut = new WctTestRunner(options);
      const actualResult = await sut.run();
      expect(actualResult.status).eq(RunStatus.Error);
      expect(actualResult.errorMessages).deep.eq([expectedError.stack]);
    });
  });
});
