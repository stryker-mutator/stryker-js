import { createRequire } from 'module';

import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { requireResolve } from '@stryker-mutator/util';
import sinon from 'sinon';

import { CustomJestConfigLoader } from '../../../src/config-loaders/custom-jest-config-loader.js';
import { ReactScriptsJestConfigLoader } from '../../../src/config-loaders/react-scripts-jest-config-loader.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/jest-runner-options-with-stryker-options.js';
import { configLoaderFactory } from '../../../src/config-loaders/index.js';
import { pluginTokens } from '../../../src/plugin-di.js';
import { JestConfigWrapper, JestWrapper } from '../../../src/utils/index.js';

describe(configLoaderFactory.name, () => {
  let options: JestRunnerOptionsWithStrykerOptions;
  let jestWrapper: JestWrapper;
  let jestConfigWrapper: sinon.SinonStubbedInstance<JestConfigWrapper>;

  beforeEach(() => {
    jestWrapper = new JestWrapper(process.cwd(), requireResolve);
    jestConfigWrapper = sinon.createStubInstance(JestConfigWrapper);
    options = factory.strykerWithPluginOptions({
      jest: {
        enableBail: true,
        enableFindRelatedTests: true,
        projectType: 'custom',
      },
    });
  });

  it('should call a CustomJestConfigLoader no projectType is defined', () => {
    const sut = createSut();

    expect(sut).instanceOf(CustomJestConfigLoader);
  });

  describe('with "projectType": "create-react-app"', () => {
    beforeEach(() => {
      options.jest.projectType = 'create-react-app';
    });

    it('should create a ReactScriptsJestConfigLoader', () => {
      const sut = createSut();

      expect(sut).instanceOf(ReactScriptsJestConfigLoader);
    });

    it('should warn when a configFile is set', () => {
      options.jest.configFile = 'jest.conf.js';

      createSut();

      expect(testInjector.logger.warn).calledWith(
        `Config setting "configFile" is not supported for projectType "${options.jest.projectType}"`,
      );
    });
  });
  function createSut() {
    return testInjector.injector
      .provideValue(commonTokens.options, options)
      .provideValue(pluginTokens.jestWrapper, jestWrapper)
      .provideValue(pluginTokens.jestConfigWrapper, jestConfigWrapper)
      .provideValue(
        pluginTokens.resolve,
        createRequire(import.meta.url).resolve,
      )
      .provideValue(pluginTokens.requireFromCwd, requireResolve)
      .provideValue(pluginTokens.processEnv, process.env)
      .injectFunction(configLoaderFactory);
  }
});
