import JestPromiseTestAdapter from '../../../src/jestTestAdapters/JestPromiseTestAdapter';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';
import * as logging from 'stryker-api/logging';
import * as jest from 'jest';

describe('JestPromiseTestAdapter', () => {
  let jestPromiseTestAdapter: JestPromiseTestAdapter;

  let sandbox: sinon.SinonSandbox;
  let runCLIStub: sinon.SinonStub;
  let traceLoggerStub: sinon.SinonStub;

  const projectRoot = '/path/to/project';
  const jestConfig: any = { rootDir: projectRoot };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    runCLIStub = sandbox.stub(jest, 'runCLI');
    runCLIStub.callsFake((config: object, projectRootArray: string[]) => Promise.resolve({
      config,
      result: 'testResult'
    }));

    traceLoggerStub = sinon.stub();
    sandbox.stub(logging, 'getLogger').returns({ trace: traceLoggerStub });

    jestPromiseTestAdapter = new JestPromiseTestAdapter();
  });

  afterEach(() => sandbox.restore());

  it('should set reporters to an empty array', async () => {
    await jestPromiseTestAdapter.run(jestConfig, projectRoot);

    expect(jestConfig.reporters).to.be.an('array').that.is.empty;
  });

  it('should call the runCLI method with the correct projectRoot', async () => {
    await jestPromiseTestAdapter.run(jestConfig, projectRoot);

    assert(runCLIStub.calledWith({
      config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
      runInBand: true,
      silent: true
    }, [projectRoot]));
  });

  it('should call the runCLI method and return the test result', async () => {
    const result = await jestPromiseTestAdapter.run(jestConfig, projectRoot);

    expect(result).to.deep.equal({
      config: {
        config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
        runInBand: true,
        silent: true
      },
      result: 'testResult'
    });
  });

  it('should trace log a message when jest is invoked', async () => {
    await jestPromiseTestAdapter.run(jestConfig, projectRoot);

    const expectedResult: any = JSON.parse(JSON.stringify(jestConfig));
    expectedResult.reporters = [];

    assert(traceLoggerStub.calledWithMatch(/Invoking Jest with config\s.*/));
  });
});
