import path from 'path';

import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import type { requireResolve } from '@stryker-mutator/util';

import { ReactScriptsJestConfigLoader } from '../../../src/config-loaders/react-scripts-jest-config-loader.js';
import * as pluginTokens from '../../../src/plugin-tokens.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/jest-runner-options-with-stryker-options.js';
import { createJestOptions } from '../../helpers/producers.js';

describe(ReactScriptsJestConfigLoader.name, () => {
  let sut: ReactScriptsJestConfigLoader;
  let requireResolveStub: sinon.SinonStub;
  let requireFromCwdStub: sinon.SinonStubbedMember<typeof requireResolve>;
  let createReactJestConfigStub: sinon.SinonStub;
  let processEnvMock: NodeJS.ProcessEnv;

  beforeEach(() => {
    createReactJestConfigStub = sinon.stub();
    requireResolveStub = sinon.stub();
    requireResolveStub.returns(path.resolve('./node_modules/react-scripts/package.json'));
    createReactJestConfigStub.returns({ testPaths: ['example'] });
    requireFromCwdStub = sinon.stub();
    requireFromCwdStub.returns(createReactJestConfigStub);
    processEnvMock = {
      NODE_ENV: undefined,
    };
    sut = testInjector.injector
      .provideValue(pluginTokens.processEnv, processEnvMock)
      .provideValue(pluginTokens.resolve, requireResolveStub as unknown as RequireResolve)
      .provideValue(pluginTokens.requireFromCwd, requireFromCwdStub)
      .injectClass(ReactScriptsJestConfigLoader);
  });

  it('should load the configuration via the createJestConfig method provided by react-scripts', () => {
    const config = sut.loadConfig();

    expect(requireResolveStub).calledWith('react-scripts/package.json');
    expect(requireFromCwdStub).calledWith('react-scripts/scripts/utils/createJestConfig');
    expect(createReactJestConfigStub).calledWith(sinon.match.func, process.cwd(), false);
    expect(config).deep.eq({ testPaths: ['example'] });
  });

  it('should throw an error when react-scripts could not be found', () => {
    // Arrange
    const error: NodeJS.ErrnoException = new Error('');
    error.code = 'MODULE_NOT_FOUND';
    requireResolveStub.throws(error);

    // Act & Assert
    expect(() => sut.loadConfig()).throws(
      'Unable to locate package "react-scripts". This package is required when "jest.projectType" is set to "create-react-app".'
    );
  });

  it('should load "react-scripts/config/env.js" when projectType = create-react-app', async () => {
    const options = testInjector.options as JestRunnerOptionsWithStrykerOptions;
    options.jest = createJestOptions({ projectType: 'create-react-app' });
    sut.loadConfig();
    expect(requireFromCwdStub).calledWith('react-scripts/config/env.js');
  });

  it("should set process.env.NODE_ENV to 'test' when process.env.NODE_ENV is null", () => {
    sut.loadConfig();

    expect(processEnvMock.NODE_ENV).to.equal('test');
  });

  it('should keep the value set in process.env.NODE_ENV if not null', () => {
    processEnvMock.NODE_ENV = 'stryker';

    sut.loadConfig();

    expect(processEnvMock.NODE_ENV).to.equal('stryker');
  });
});
