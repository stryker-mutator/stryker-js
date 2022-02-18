import sinon from 'sinon';
import { expect } from 'chai';

import { PartialStrykerOptions } from '@stryker-mutator/api/src/core';
import { testInjector } from '@stryker-mutator/test-helpers';

import { resolveFromRoot } from '../../helpers/test-utils.js';
import { PrepareExecutor } from '../../../src/process/index.js';

describe(`${PrepareExecutor.name} integration test`, () => {
  it('should log about unknown properties in log file', async () => {
    const cliOptions: PartialStrykerOptions = {
      configFile: resolveFromRoot('testResources', 'options-validation', 'unknown-options.conf.json'),
    };
    const sut = testInjector.injector.injectClass(PrepareExecutor);
    await sut.execute(cliOptions);
    expect(testInjector.logger.warn).calledWithMatch(sinon.match('Unknown stryker config option "this is an unknown property"'));
  });
});
