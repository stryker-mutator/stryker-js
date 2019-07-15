import { jestTestAdapterFactory, JEST_VERSION_TOKEN, JestTestAdapter } from '../../../src/jestTestAdapters';
import JestPromiseTestAdapter from '../../../src/jestTestAdapters/JestPromiseTestAdapter';
import { expect } from 'chai';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';

describe(jestTestAdapterFactory.name, () => {
  let jestVersion: string;

  function act(): JestTestAdapter {
    return TEST_INJECTOR.injector
      .provideValue(JEST_VERSION_TOKEN, jestVersion)
      .injectFunction(jestTestAdapterFactory);
  }

  it('should return a Promise-based adapter when the Jest version is higher or equal to 22.0.0', () => {
    jestVersion = '22.0.0';
    const testAdapter = act();

    expect(testAdapter).instanceOf(JestPromiseTestAdapter);
  });

  it('should throw an error when the Jest version is lower than 22.0.0', () => {
    jestVersion = '21.0.0';

    expect(() => act()).to.throw(Error, 'You need Jest version >= 22.0.0 to use Stryker');
    expect(TEST_INJECTOR.logger.debug).calledWith('Detected Jest below 22.0.0: %s', jestVersion);
  });

});
