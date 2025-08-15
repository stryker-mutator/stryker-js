import sinon from 'sinon';
import { expect } from 'chai';

import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';

import { resolveFromRoot } from '../../helpers/test-utils.js';
import { PrepareExecutor } from '../../../src/process/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { LoggingServerAddress } from '../../../src/logging/logging-server.js';
import { LoggingBackend } from '../../../src/logging/logging-backend.js';

describe(`${PrepareExecutor.name} integration test`, () => {
  it('should log about unknown properties in log file', async () => {
    const cliOptions: PartialStrykerOptions = {
      configFile: resolveFromRoot(
        'testResources',
        'options-validation',
        'unknown-options.conf.json',
      ),
    };
    const sut = testInjector.injector
      .provideValue(coreTokens.reporterOverride, undefined)
      .provideValue(
        coreTokens.loggingSink,
        sinon.createStubInstance(LoggingBackend),
      )
      .provideValue(coreTokens.loggingServerAddress, {
        port: 4200,
      } satisfies LoggingServerAddress)
      .injectClass(PrepareExecutor);
    await sut.execute(cliOptions);
    expect(testInjector.logger.warn).calledWithMatch(
      sinon.match(
        'Unknown stryker config option "this is an unknown property"',
      ),
    );
  });
});
