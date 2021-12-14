import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { Config } from '@jest/types';

import { JestGreaterThan25TestAdapter } from '../../../src/jest-test-adapters/jest-greater-than-25-adapter';
import { jestWrapper } from '../../../src/utils/jest-wrapper';

describe(JestGreaterThan25TestAdapter.name, () => {
  let sut: JestGreaterThan25TestAdapter;
  let runCLIStub: sinon.SinonStub;

  const fileNamesUnderTest = ['/path/to/file'];
  let jestConfig: Config.InitialOptions;

  beforeEach(() => {
    jestConfig = { rootDir: '/path/to/project' };
    runCLIStub = sinon.stub(jestWrapper, 'runCLI');
    runCLIStub.resolves({
      config: jestConfig,
      result: 'testResult',
    });

    sut = testInjector.injector.injectClass(JestGreaterThan25TestAdapter);
  });

  it('should call the runCLI method with the correct --projectRoot', async () => {
    await sut.run({ jestConfig });
    expect(runCLIStub).calledWith(sinon.match.object, [jestConfig.rootDir!]);
  });

  it('should call the runCLI method with --projectRoot = cwd when no rootDir is provided', async () => {
    delete jestConfig.rootDir;
    await sut.run({ jestConfig });
    expect(runCLIStub).calledWith(sinon.match.object, [process.cwd()]);
  });

  it('should call the runCLI method with the --findRelatedTests flag when provided', async () => {
    await sut.run({ jestConfig, fileNamesUnderTest });

    expect(runCLIStub).calledWith(
      sinon.match({
        $0: 'stryker',
        _: fileNamesUnderTest,
        config: JSON.stringify(jestConfig),
        findRelatedTests: true,
        runInBand: true,
        silent: true,
        testNamePattern: undefined,
      }),
      [jestConfig.rootDir!]
    );
  });

  it('should call the runCLI method with the --testNamePattern flag when provided', async () => {
    await sut.run({ jestConfig, testNamePattern: 'Foo should bar' });

    expect(runCLIStub).calledWith(
      sinon.match({
        $0: 'stryker',
        _: [],
        config: JSON.stringify(jestConfig),
        findRelatedTests: false,
        runInBand: true,
        silent: true,
        testNamePattern: 'Foo should bar',
      }),
      [jestConfig.rootDir!]
    );
  });

  it('should call the runCLI method with the --testLocationInResults flag when provided', async () => {
    await sut.run({ jestConfig, testLocationInResults: true });

    expect(runCLIStub).calledWith(
      sinon.match({
        testLocationInResults: true,
      }),
      [jestConfig.rootDir!]
    );
  });

  it('should call the runCLI method without the --testLocationInResults flag when not', async () => {
    await sut.run({ jestConfig, testLocationInResults: false });
    expect(runCLIStub).calledWith(sinon.match({ testLocationInResults: false }), [jestConfig.rootDir!]);
  });

  it('should call the runCLI method and return the test result', async () => {
    const result = await sut.run({ jestConfig });

    expect(result).to.deep.equal({
      config: jestConfig,
      result: 'testResult',
    });
  });

  it('should call the runCLI method and return the test result when run with --findRelatedTests flag', async () => {
    const result = await sut.run({ jestConfig, fileNamesUnderTest });

    expect(result).to.deep.equal({
      config: jestConfig,
      result: 'testResult',
    });
  });
});
