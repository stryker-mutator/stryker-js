import { createRequire } from 'module';

import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { requireResolve } from '@stryker-mutator/util';

import { JestTestAdapter, jestTestAdapterFactory } from '../../../src/jest-test-adapters/index.js';
import { JestGreaterThan25TestAdapter } from '../../../src/jest-test-adapters/jest-greater-than-25-adapter.js';
import { JestLessThan25TestAdapter } from '../../../src/jest-test-adapters/jest-less-than-25-adapter.js';
import { pluginTokens } from '../../../src/plugin-di.js';
import { JestWrapper } from '../../../src/utils/jest-wrapper.js';
import { JestConfigWrapper } from '../../../src/utils/index.js';

describe(jestTestAdapterFactory.name, () => {
  let jestWrapperMock: sinon.SinonStubbedInstance<JestWrapper>;
  let jestConfigWrapperMock: sinon.SinonStubbedInstance<JestConfigWrapper>;

  beforeEach(() => {
    jestWrapperMock = sinon.createStubInstance(JestWrapper);
    jestConfigWrapperMock = sinon.createStubInstance(JestConfigWrapper);
  });

  function act(): JestTestAdapter {
    return testInjector.injector
      .provideValue(pluginTokens.jestWrapper, jestWrapperMock)
      .provideValue(pluginTokens.jestConfigWrapper, jestConfigWrapperMock)
      .provideValue(pluginTokens.resolve, createRequire(import.meta.url).resolve)
      .provideValue(pluginTokens.requireFromCwd, requireResolve)
      .provideValue(pluginTokens.processEnv, process.env)
      .injectFunction(jestTestAdapterFactory);
  }

  it('should log the jest version on debug', () => {
    jestWrapperMock.getVersion.returns('25.0.0');
    act();
    expect(testInjector.logger.debug).calledWith('Detected Jest version %s', '25.0.0');
  });

  it('should return a JestGreaterThan25Adapter when the Jest version is greater or equal to 25.0.0', () => {
    jestWrapperMock.getVersion.returns('25.0.0');
    const testAdapter = act();

    expect(testAdapter).instanceOf(JestGreaterThan25TestAdapter);
  });
  it('should return a JestGreaterThan25Adapter when the Jest version is an alpha version greater than 25.0.0', () => {
    jestWrapperMock.getVersion.returns('30.0.0-alpha.6');
    const testAdapter = act();

    expect(testAdapter).instanceOf(JestGreaterThan25TestAdapter);
  });
  it('should return a JestLessThan25Adapter when the Jest version is greater or equal to 22.0.0, but less then 25 and coverage analysis is disabled', () => {
    testInjector.options.coverageAnalysis = 'off';
    jestWrapperMock.getVersion.returns('22.0.0');
    const testAdapter = act();

    expect(testAdapter).instanceOf(JestLessThan25TestAdapter);
  });
  it('should return a JestLessThan25Adapter when the Jest version is an alpha version greater than 22.0.0, lower than 25', () => {
    testInjector.options.coverageAnalysis = 'off';
    jestWrapperMock.getVersion.returns('23.0.0-alpha.6');
    const testAdapter = act();

    expect(testAdapter).instanceOf(JestLessThan25TestAdapter);
  });

  it('should throw an error when the Jest version is lower than 22.0.0', () => {
    jestWrapperMock.getVersion.returns('21.0.0');

    expect(act).to.throw(Error, 'You need Jest version >= 22.0.0 to use the @stryker-mutator/jest-runner plugin, found 21.0.0');
  });

  it('should throw an error when the Jest version is an alpha version lower than 22.0.0', () => {
    jestWrapperMock.getVersion.returns('21.0.0-alpha.6');

    expect(act).to.throw(Error, 'You need Jest version >= 22.0.0 to use the @stryker-mutator/jest-runner plugin, found 21.0.0-alpha.6');
  });

  it('should throw an error when the Jest version is between 22 and 24, but coverage analysis is enabled', () => {
    jestWrapperMock.getVersion.returns('23.0.0');
    testInjector.options.coverageAnalysis = 'all';

    expect(act).to.throw(
      Error,
      'You need Jest version >= 24.0.0 to use the @stryker-mutator/jest-runner with "coverageAnalysis": "all", you\'re currently using version 23.0.0. Please upgrade your jest version, or set "coverageAnalysis": "off".',
    );
  });

  it('should allow Jest version is between 22 and 24 if coverage analysis is "off"', () => {
    jestWrapperMock.getVersion.returns('23.0.0');
    testInjector.options.coverageAnalysis = 'off';

    expect(act).to.not.throw();
  });

  it('should log a deprecation warning when using jest version < 24 and coverage analysis is "off"', () => {
    testInjector.options.coverageAnalysis = 'off';
    jestWrapperMock.getVersion.returns('23.1.2');
    expect(act).to.not.throw();
    expect(testInjector.logger.warn).calledWith(
      '[DEPRECATED] Support for Jest version < 24 is deprecated and will be removed in the next major version of Stryker, please upgrade your jest version (your current version is %s).',
      '23.1.2',
    );
  });
});
