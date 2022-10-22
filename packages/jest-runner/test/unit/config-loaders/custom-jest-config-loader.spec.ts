import path from 'path';

import type { Config } from '@jest/types';
import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import jestConfig from 'jest-config';

import { CustomJestConfigLoader } from '../../../src/config-loaders/custom-jest-config-loader.js';
import { createJestOptions } from '../../helpers/producers.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/jest-runner-options-with-stryker-options.js';

describe(CustomJestConfigLoader.name, () => {
  let readInitialOptionsStub: sinon.SinonStubbedMember<typeof jestConfig.readInitialOptions>;
  let options: JestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    readInitialOptionsStub = sinon.stub(jestConfig, 'readInitialOptions');
    testInjector.options.jest = createJestOptions();
    options = testInjector.options as JestRunnerOptionsWithStrykerOptions;
  });

  it('should readInitialOptions ', async () => {
    const expectedOptions: Config.InitialOptions = { displayName: 'test' };
    readInitialOptionsStub.resolves({ config: expectedOptions, configPath: 'my-foo-jest-config.js' });
    const sut = testInjector.injector.injectClass(CustomJestConfigLoader);
    const actualOptions = await sut.loadConfig();
    expect(actualOptions).eq(expectedOptions);
    sinon.assert.calledOnceWithExactly(readInitialOptionsStub, undefined, { skipMultipleConfigError: true });
  });

  it('should readInitialOptions with a custom jest config file', async () => {
    options.jest.configFile = 'my-foo-jest-config.js';
    const expectedOptions: Config.InitialOptions = { displayName: 'test' };
    readInitialOptionsStub.resolves({ config: expectedOptions, configPath: 'my-foo-jest-config.js' });
    const sut = testInjector.injector.injectClass(CustomJestConfigLoader);
    await sut.loadConfig();
    sinon.assert.calledOnceWithExactly(readInitialOptionsStub, 'my-foo-jest-config.js', { skipMultipleConfigError: true });
  });

  it('should log where config was read from', async () => {
    readInitialOptionsStub.resolves({ config: {}, configPath: path.resolve('my-foo-jest-config.js') });
    const sut = testInjector.injector.injectClass(CustomJestConfigLoader);
    await sut.loadConfig();
    sinon.assert.calledWith(testInjector.logger.debug, 'Read config from "my-foo-jest-config.js".');
  });

  it('should log when no config file was read', async () => {
    readInitialOptionsStub.resolves({ config: {}, configPath: null });
    const sut = testInjector.injector.injectClass(CustomJestConfigLoader);
    await sut.loadConfig();
    sinon.assert.calledWith(testInjector.logger.debug, 'No config file read.');
  });
});
