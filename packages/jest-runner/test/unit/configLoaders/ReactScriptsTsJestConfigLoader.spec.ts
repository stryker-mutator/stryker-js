import path from 'path';

import { assert, expect } from 'chai';
import sinon from 'sinon';
import { Logger } from '@stryker-mutator/api/logging';
import { logger } from '@stryker-mutator/test-helpers/src/factory';

import ReactScriptsTSJestConfigLoader from '../../../src/configLoaders/ReactScriptsTSJestConfigLoader';
import * as helper from '../../../src/utils/createReactJestConfig';

describe(ReactScriptsTSJestConfigLoader.name, () => {
  let sut: ReactScriptsTSJestConfigLoader;
  let requireResolveStub: sinon.SinonStub;
  let createReactJestConfigStub: sinon.SinonStub;
  let loggerStub: sinon.SinonStubbedInstance<Logger>;

  const projectRoot = '/path/to/project';
  const reactScriptsTsPackagePath = './node_modules/react-scripts-ts/package.json';

  beforeEach(() => {
    createReactJestConfigStub = sinon.stub(helper, 'createReactTsJestConfig');
    createReactJestConfigStub.callsFake((resolve: any, projectRoot: string, eject: boolean) => ({
      eject,
      projectRoot,
      relativePath: resolve('test'),
    }));

    requireResolveStub = sinon.stub();
    requireResolveStub.returns(reactScriptsTsPackagePath);

    loggerStub = logger();

    sut = new ReactScriptsTSJestConfigLoader(loggerStub, (requireResolveStub as unknown) as RequireResolve, projectRoot);
  });

  it('should load the configuration via the createJestConfig method provided by react-scripts-ts', () => {
    sut.loadConfig();

    assert(requireResolveStub.calledWith('react-scripts-ts/package.json'));
  });

  it('should log a deprecation warning', () => {
    sut.loadConfig();

    assert(loggerStub.warn.calledWith('DEPRECATED: The support for create-react-app-ts projects is deprecated and will be removed in the future. Please migrate your project to create-react-app-ts and update your Stryker config setting to "create-react-app"'));
  });

  it('should generate a configuration', () => {
    const config = sut.loadConfig();

    expect(config).to.deep.equal({
      eject: false,
      projectRoot: '/path/to/project',
      relativePath: path.join('node_modules', 'react-scripts-ts', 'test'),
      testEnvironment: 'jsdom',
    });
  });

  it('should throw an error when react-scripts could not be found', () => {
    // Arrange
    const error: NodeJS.ErrnoException = new Error('');
    error.code = 'MODULE_NOT_FOUND';
    requireResolveStub.throws(error);

    // Act & Assert
    expect(() => sut.loadConfig()).throws(
      'Unable to locate package react-scripts-ts. This package is required when projectType is set to "create-react-app-ts".'
    );
  });
});
