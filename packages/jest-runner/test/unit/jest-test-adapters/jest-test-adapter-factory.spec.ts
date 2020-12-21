import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { JestTestAdapter, jestTestAdapterFactory } from '../../../src/jest-test-adapters';
import JestGreaterThan25Adapter from '../../../src/jest-test-adapters/jest-greater-than-25-adapter';
import JestLessThan25Adapter from '../../../src/jest-test-adapters/jest-less-than-25-adapter';
import * as pluginTokens from '../../../src/plugin-tokens';

describe(jestTestAdapterFactory.name, () => {
  let jestVersion: string;

  function act(): JestTestAdapter {
    return testInjector.injector.provideValue(pluginTokens.jestVersion, jestVersion).injectFunction(jestTestAdapterFactory);
  }

  it('should log the jest version on debug', () => {
    jestVersion = '25.0.0';
    act();
    expect(testInjector.logger.debug).calledWith('Detected Jest version %s', jestVersion);
  });

  it('should return a JestGreaterThan25Adapter when the Jest version is higher or equal to 25.0.0', () => {
    jestVersion = '25.0.0';
    const testAdapter = act();

    expect(testAdapter).instanceOf(JestGreaterThan25Adapter);
  });
  it('should return a JestLessThan25Adapter when the Jest version is higher or equal to 22.0.0, but less then 25', () => {
    jestVersion = '22.0.0';
    const testAdapter = act();

    expect(testAdapter).instanceOf(JestLessThan25Adapter);
  });

  it('should throw an error when the Jest version is lower than 22.0.0', () => {
    jestVersion = '21.0.0';

    expect(() => act()).to.throw(Error, 'You need Jest version >= 22.0.0 to use the @stryker-mutator/jest-runner plugin, found 21.0.0');
  });

  it('should throw an error when the Jest version is between 22 and 24, but coverage analysis is enabled', () => {
    jestVersion = '23.0.0';
    testInjector.options.coverageAnalysis = 'all';

    expect(() => act()).to.throw(
      Error,
      'You need Jest version >= 24.0.0 to use the @stryker-mutator/jest-runner with "coverageAnalysis": "all", you\'re currently using version 23.0.0. Please upgrade your jest version, or set "coverageAnalysis": "off".'
    );
  });

  it('should allow Jest version is between 22 and 24 if coverage analysis is "off"', () => {
    jestVersion = '23.0.0';
    testInjector.options.coverageAnalysis = 'off';

    expect(() => act()).to.not.throw();
  });

  it('should log a deprecation warning when using jest version < 24', () => {
    jestVersion = '23.1.2';
    expect(() => act()).to.not.throw();
    expect(testInjector.logger.warn).calledWith(
      '[DEPRECATED] Support for Jest version < 24 is deprecated and will be removed in the next major version of Stryker, please upgrade your jest version (your current version is %s).',
      '23.1.2'
    );
  });
});
