import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import JestGreaterThan25Adapter from '../../../src/jestTestAdapters/JestGreaterThan25Adapter';
import { jestWrapper } from '../../../src/utils/jestWrapper';

describe(JestGreaterThan25Adapter.name, () => {
  let sut: JestGreaterThan25Adapter;
  let runCLIStub: sinon.SinonStub;

  const projectRoot = '/path/to/project';
  const fileNameUnderTest = '/path/to/file';
  const jestConfig: any = { rootDir: projectRoot };

  beforeEach(() => {
    runCLIStub = sinon.stub(jestWrapper, 'runCLI');
    runCLIStub.callsFake((config: Record<string, unknown>) =>
      Promise.resolve({
        config,
        result: 'testResult',
      })
    );

    sut = testInjector.injector.injectClass(JestGreaterThan25Adapter);
  });

  it('should set reporters to an empty array', async () => {
    await sut.run(jestConfig, projectRoot);

    expect(jestConfig.reporters).to.be.an('array').that.is.empty;
  });

  it('should call the runCLI method with the correct projectRoot', async () => {
    await sut.run(jestConfig, projectRoot);

    expect(runCLIStub).calledWith(
      {
        $0: 'stryker',
        _: [],
        config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
        runInBand: true,
        silent: true,
        findRelatedTests: false,
      },
      [projectRoot]
    );
  });

  it('should call the runCLI method with the --findRelatedTests flag', async () => {
    await sut.run(jestConfig, projectRoot, fileNameUnderTest);

    expect(runCLIStub).calledWith(
      {
        $0: 'stryker',
        _: [fileNameUnderTest],
        config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
        findRelatedTests: true,
        runInBand: true,
        silent: true,
      },
      [projectRoot]
    );
  });

  it('should call the runCLI method and return the test result', async () => {
    const result = await sut.run(jestConfig, projectRoot);

    expect(result).to.deep.equal({
      config: {
        $0: 'stryker',
        _: [],
        config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
        runInBand: true,
        silent: true,
        findRelatedTests: false,
      },
      result: 'testResult',
    });
  });

  it('should call the runCLI method and return the test result when run with --findRelatedTests flag', async () => {
    const result = await sut.run(jestConfig, projectRoot, fileNameUnderTest);

    expect(result).to.deep.equal({
      config: {
        $0: 'stryker',
        _: [fileNameUnderTest],
        config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
        findRelatedTests: true,
        runInBand: true,
        silent: true,
      },
      result: 'testResult',
    });
  });

  it('should trace log a message when jest is invoked', async () => {
    await sut.run(jestConfig, projectRoot);

    const expectedResult: any = JSON.parse(JSON.stringify(jestConfig));
    expectedResult.reporters = [];

    expect(testInjector.logger.trace).calledWithMatch(/Invoking Jest with config\s.*/);
  });
});
