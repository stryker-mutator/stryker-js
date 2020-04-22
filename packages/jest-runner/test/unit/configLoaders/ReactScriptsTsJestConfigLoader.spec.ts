import path from 'path';

import { assert, expect } from 'chai';
import sinon from 'sinon';

import ReactScriptsTSJestConfigLoader from '../../../src/configLoaders/ReactScriptsTSJestConfigLoader';
import * as helper from '../../../src/utils/createReactJestConfig';

describe(ReactScriptsTSJestConfigLoader.name, () => {
  let sut: ReactScriptsTSJestConfigLoader;
  let requireResolveStub: sinon.SinonStub;
  let createReactJestConfigStub: sinon.SinonStub;

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

    sut = new ReactScriptsTSJestConfigLoader(projectRoot, (requireResolveStub as unknown) as RequireResolve);
  });

  it('should load the configuration via the createJestConfig method provided by react-scripts-ts', () => {
    sut.loadConfig();

    assert(requireResolveStub.calledWith('react-scripts-ts/package.json'));
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
