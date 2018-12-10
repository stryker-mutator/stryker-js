import JestPromiseTestAdapter from '../../../src/jestTestAdapters/JestPromiseTestAdapter';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';
import * as jest from 'jest';
import currentLogMock from '../../helpers/logMock';

describe('JestPromiseTestAdapter', () => {
  let jestPromiseTestAdapter: JestPromiseTestAdapter;
  let runCLIStub: sinon.SinonStub;

  const projectRoot = '/path/to/project';
  const fileNameUnderTest = '/path/to/file';
  const jestConfig: any = { rootDir: projectRoot };

  beforeEach(() => {
    runCLIStub = sinon.stub(jest, 'runCLI');
    runCLIStub.callsFake((config: object) => Promise.resolve({
      config,
      result: 'testResult'
    }));

    jestPromiseTestAdapter = new JestPromiseTestAdapter();
  });

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

  it('should call the runCLI method with the --findRelatedTests flag', async () => {
    await jestPromiseTestAdapter.run(jestConfig, projectRoot, fileNameUnderTest);

    assert(runCLIStub.calledWith({
      _: [fileNameUnderTest],
      config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
      findRelatedTests: true,
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

  it('should call the runCLI method and return the test result when run with --findRelatedTests flag', async () => {
    const result = await jestPromiseTestAdapter.run(jestConfig, projectRoot, fileNameUnderTest);

    expect(result).to.deep.equal({
      config: {
        _: [fileNameUnderTest],
        config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
        findRelatedTests: true,
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

    assert(currentLogMock().trace.calledWithMatch(/Invoking Jest with config\s.*/));
  });
});
