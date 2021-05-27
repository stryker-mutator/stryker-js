import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { Config } from '@jest/types';

import { JestGreaterThan25TestAdapter } from '../../../src/jest-test-adapters/jest-greater-than-25-adapter';
import { jestWrapper } from '../../../src/utils/jest-wrapper';

describe(JestGreaterThan25TestAdapter.name, () => {
  let sut: JestGreaterThan25TestAdapter;
  let runCLIStub: sinon.SinonStub;

  const projectRoot = '/path/to/project';
  const fileNameUnderTest = '/path/to/file';
  const jestConfig: Config.InitialOptions = { rootDir: projectRoot };

  beforeEach(() => {
    runCLIStub = sinon.stub(jestWrapper, 'runCLI');
    runCLIStub.resolves({
      config: jestConfig,
      result: 'testResult',
    });

    sut = testInjector.injector.injectClass(JestGreaterThan25TestAdapter);
  });

  it('should call the runCLI method with the correct ---projectRoot', async () => {
    await sut.run({ jestConfig, projectRoot });
    expect(runCLIStub).calledWith(sinon.match.object, [projectRoot]);
  });

  it('should call the runCLI method with the --findRelatedTests flag when provided', async () => {
    await sut.run({ jestConfig, projectRoot, fileNameUnderTest });

    expect(runCLIStub).calledWith(
      sinon.match({
        $0: 'stryker',
        _: [fileNameUnderTest],
        config: JSON.stringify({ rootDir: projectRoot }),
        findRelatedTests: true,
        runInBand: true,
        silent: true,
        testNamePattern: undefined,
      }),
      [projectRoot]
    );
  });

  it('should call the runCLI method with the --testNamePattern flag when provided', async () => {
    await sut.run({ jestConfig, projectRoot, testNamePattern: 'Foo should bar' });

    expect(runCLIStub).calledWith(
      sinon.match({
        $0: 'stryker',
        _: [],
        config: JSON.stringify({ rootDir: projectRoot }),
        findRelatedTests: false,
        runInBand: true,
        silent: true,
        testNamePattern: 'Foo should bar',
      }),
      [projectRoot]
    );
  });

  it('should call the runCLI method with the --testLocationInResults flag when provided', async () => {
    await sut.run({ jestConfig, projectRoot, testLocationInResults: true });

    expect(runCLIStub).calledWith(
      sinon.match({
        testLocationInResults: true,
      }),
      [projectRoot]
    );
  });

  it('should call the runCLI method without the --testLocationInResults flag when not', async () => {
    await sut.run({ jestConfig, projectRoot, testLocationInResults: false });
    expect(runCLIStub).calledWith(sinon.match({ testLocationInResults: false }), [projectRoot]);
  });

  it('should call the runCLI method and return the test result', async () => {
    const result = await sut.run({ jestConfig, projectRoot });

    expect(result).to.deep.equal({
      config: jestConfig,
      result: 'testResult',
    });
  });

  it('should call the runCLI method and return the test result when run with --findRelatedTests flag', async () => {
    const result = await sut.run({ jestConfig, projectRoot, fileNameUnderTest });

    expect(result).to.deep.equal({
      config: jestConfig,
      result: 'testResult',
    });
  });
});
