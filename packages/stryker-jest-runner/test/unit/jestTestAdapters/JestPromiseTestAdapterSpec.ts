import JestPromiseTestAdapter from '../../../src/jestTestAdapters/JestPromiseTestAdapter';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';
import * as jest from 'jest';
import currentLogMock from '../../helpers/logMock';

describe('JestPromiseTestAdapter', () => {
  let jestPromiseTestAdapter: JestPromiseTestAdapter;
  let runCLIStub: sinon.SinonStub;

  const projectRoot = '/path/to/project';
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
    await jestPromiseTestAdapter.run(jestConfig, projectRoot, true);

    expect(jestConfig.reporters).to.be.an('array').that.is.empty;
  });

  it('should call the runCLI method with the correct projectRoot', async () => {
    await jestPromiseTestAdapter.run(jestConfig, projectRoot, true);

    assert(runCLIStub.calledWith({
      config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
      runInBand: true,
      silent: true
    }, [projectRoot]));
  });

  it('should call the runCLI method and return the test result', async () => {
    const result = await jestPromiseTestAdapter.run(jestConfig, projectRoot, true);

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
    await jestPromiseTestAdapter.run(jestConfig, projectRoot, true);

    const expectedResult: any = JSON.parse(JSON.stringify(jestConfig));
    expectedResult.reporters = [];

    assert(currentLogMock().trace.calledWithMatch(/Invoking Jest with config\s.*/));
  });
});
