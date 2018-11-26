import { steps } from 'web-component-tester';
import * as wctModule from 'web-component-tester';
import * as contextModule from 'web-component-tester/runner/context';
import * as sinon from 'sinon';
import WctTestRunner from '../../src/WctTestRunner';
import WctLogger, * as wctLoggerModule from '../../src/WctLogger';
import WctReporter, * as wctReporterModule from '../../src/WctReporter';
import { expect } from 'chai';
import { TestStatus, RunResult, RunStatus } from 'stryker-api/test_runner';

describe(WctTestRunner.name, () => {

  let contextMock: sinon.SinonStubbedInstance<contextModule.Context>;
  let wctLoggerMock: sinon.SinonStubbedInstance<WctLogger>;
  let wctReporterMock: sinon.SinonStubbedInstance<WctReporter>;
  let stepsMock: sinon.SinonStubbedInstance<typeof steps>;

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
    contextMock.options = {};
    wctLoggerMock = sinon.createStubInstance(WctLogger);
    wctReporterMock = sinon.createStubInstance(WctReporter);
    sinon.stub(contextModule, 'Context').returns(contextMock);
    sinon.stub(wctLoggerModule, 'default').returns(wctLoggerMock);
    sinon.stub(wctReporterModule, 'default').returns(wctReporterMock);
    sinon.stub(wctModule, 'steps').value(stepsMock);
  });

  it('should create a context using wct options', () => {
    const wctOptions = { foo: 'bar' };
    new WctTestRunner({ strykerOptions: { wct: wctOptions } });
    expect(contextModule.Context).calledWithNew;
    expect(contextModule.Context).calledWith(wctOptions);
  });

  it('should create a reporter', () => {
    new WctTestRunner({ strykerOptions: {} });
    expect(wctReporterModule.default).calledWithNew;
    expect(wctReporterModule.default).calledWith(contextMock);
  });

  it('should create a logger', () => {
    contextMock.options.verbose = true;
    new WctTestRunner({ strykerOptions: {} });
    expect(wctLoggerModule.default).calledWithNew;
    expect(wctLoggerModule.default).calledWith(contextMock, true);
  });

  describe('init', () => {
    it('should run initialization steps', async () => {
      const sut = new WctTestRunner({ strykerOptions: {} });
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
      const sut = new WctTestRunner({ strykerOptions: {} });
      sut.dispose();
      expect(wctLoggerMock.dispose).called;
      expect(wctReporterMock.dispose).called;
    });
  });

  describe('run', () => {

    it('should run clear tests', async () => {
      stepsMock.runTests.resolves();
      const sut = new WctTestRunner({ strykerOptions: {} });
      wctReporterMock.results = [{ name: 'foobar', status: TestStatus.Success, timeSpentMs: 4 }];
      const actual = await sut.run();
      const expectedRunResult: RunResult = { status: RunStatus.Complete, tests: [] };
      expect(actual).deep.eq(expectedRunResult);
    });

    it('should run tests', async () => {
      stepsMock.runTests.resolves();
      const sut = new WctTestRunner({ strykerOptions: {} });
      const runPromise = sut.run();
      const expectedTests = wctReporterMock.results = [{ name: 'foobar', status: TestStatus.Success, timeSpentMs: 4 }];
      const actual = await runPromise;
      const expectedRunResult: RunResult = { status: RunStatus.Complete, tests: expectedTests };
      expect(actual).deep.eq(expectedRunResult);
    });

    it('should ignore errors from failed tests', async () => {
      stepsMock.runTests.rejects(new Error('23 failed tests'));
      const sut = new WctTestRunner({ strykerOptions: {} });
      const runPromise = sut.run();
      const expectedTests = wctReporterMock.results = [{ name: 'foobar', status: TestStatus.Failed, timeSpentMs: 4 }];
      const actual = await runPromise;
      const expectedRunResult: RunResult = { status: RunStatus.Complete, tests: expectedTests };
      expect(actual).deep.eq(expectedRunResult);
    });

    it('should not ignore other errors', async () => {
      const expectedError = new Error('Foobar Error');
      stepsMock.runTests.rejects(expectedError);
      const sut = new WctTestRunner({ strykerOptions: {} });
      const actualResult = await sut.run();
      expect(actualResult.status).eq(RunStatus.Error);
      expect(actualResult.errorMessages).deep.eq([expectedError.stack]);
    });
  });
});
