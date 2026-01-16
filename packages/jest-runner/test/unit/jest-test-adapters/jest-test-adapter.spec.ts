import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { Config } from '@jest/types';

import { JestTestAdapter } from '../../../src/jest-test-adapters/jest-test-adapter.js';
import { JestWrapper } from '../../../src/utils/index.js';
import { createJestRunResult } from '../../helpers/producers.js';
import { JestRunResult } from '../../../src/jest-run-result.js';
import { pluginTokens } from '../../../src/plugin-di.js';

describe(JestTestAdapter.name, () => {
  let sut: JestTestAdapter;
  let jestWrapperMock: sinon.SinonStubbedInstance<JestWrapper>;

  const fileNamesUnderTest = ['/path/to/file'];
  let jestResult: JestRunResult;
  let jestConfig: Config.InitialOptions;

  beforeEach(() => {
    jestConfig = { rootDir: '/path/to/project' };
    jestResult = createJestRunResult();
    jestWrapperMock = sinon.createStubInstance(JestWrapper);
    jestWrapperMock.runCLI.resolves(jestResult);

    sut = testInjector.injector
      .provideValue(pluginTokens.jestWrapper, jestWrapperMock)
      .injectClass(JestTestAdapter);
  });

  it('should call the runCLI method with the correct --projectRoot', async () => {
    await sut.run({ jestConfig });
    expect(jestWrapperMock.runCLI).calledWith(sinon.match.object, [
      jestConfig.rootDir,
    ]);
  });

  it('should call the runCLI method with --projectRoot = cwd when no rootDir is provided', async () => {
    delete jestConfig.rootDir;
    await sut.run({ jestConfig });
    expect(jestWrapperMock.runCLI).calledWith(sinon.match.object, [
      process.cwd(),
    ]);
  });

  it('should call the runCLI method with the --findRelatedTests flag when provided', async () => {
    await sut.run({ jestConfig, fileNamesUnderTest });

    expect(jestWrapperMock.runCLI).calledWith(
      sinon.match({
        $0: 'stryker',
        _: fileNamesUnderTest,
        config: JSON.stringify(jestConfig),
        findRelatedTests: true,
        runInBand: true,
        silent: true,
        testNamePattern: undefined,
      }),
      [jestConfig.rootDir],
    );
  });

  it('should call the runCLI method with the --testNamePattern flag when provided', async () => {
    await sut.run({ jestConfig, testNamePattern: 'Foo should bar' });

    expect(jestWrapperMock.runCLI).calledWith(
      sinon.match({
        $0: 'stryker',
        _: [],
        config: JSON.stringify(jestConfig),
        findRelatedTests: false,
        runInBand: true,
        silent: true,
        testNamePattern: 'Foo should bar',
      }),
      [jestConfig.rootDir],
    );
  });

  it('should call the runCLI method with the --testLocationInResults flag when provided', async () => {
    await sut.run({ jestConfig, testLocationInResults: true });

    expect(jestWrapperMock.runCLI).calledWith(
      sinon.match({
        testLocationInResults: true,
      }),
      [jestConfig.rootDir],
    );
  });

  it('should call the runCLI method without the --testLocationInResults flag when not', async () => {
    await sut.run({ jestConfig, testLocationInResults: false });
    expect(jestWrapperMock.runCLI).calledWith(
      sinon.match({ testLocationInResults: false }),
      [jestConfig.rootDir],
    );
  });

  it('should call the runCLI method and return the test result', async () => {
    const result = await sut.run({ jestConfig });

    expect(result).to.deep.equal(jestResult);
  });

  it('should call the runCLI method and return the test result when run with --findRelatedTests flag', async () => {
    const result = await sut.run({ jestConfig, fileNamesUnderTest });

    expect(result).to.deep.equal(jestResult);
  });
});
