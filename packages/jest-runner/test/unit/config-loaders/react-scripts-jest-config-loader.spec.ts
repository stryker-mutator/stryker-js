import path from 'path';

import { expect } from 'chai';
import sinon from 'sinon';

import ReactScriptsJestConfigLoader from '../../../src/config-loaders/react-scripts-jest-config-loader';
import * as helper from '../../../src/utils/create-react-jest-config';

describe(ReactScriptsJestConfigLoader.name, () => {
  let sut: ReactScriptsJestConfigLoader;
  let requireResolveStub: sinon.SinonStub;
  let createReactJestConfigStub: sinon.SinonStub;

  const projectRoot = '/path/to/project';
  const reactScriptsPackagePath = './node_modules/react-scripts/package.json';

  beforeEach(() => {
    createReactJestConfigStub = sinon.stub(helper, 'createReactJestConfig');
    createReactJestConfigStub.callsFake((resolve: any, projectRoot: string, eject: boolean) => ({
      eject,
      projectRoot,
      relativePath: resolve('test'),
    }));

    requireResolveStub = sinon.stub();
    requireResolveStub.returns(reactScriptsPackagePath);

    sut = new ReactScriptsJestConfigLoader((requireResolveStub as unknown) as RequireResolve, projectRoot);
  });

  it('should load the configuration via the createJestConfig method provided by react-scripts', () => {
    sut.loadConfig();

    expect(requireResolveStub).calledWith('react-scripts/package.json');
  });

  it('should generate a configuration', () => {
    const config = sut.loadConfig();

    expect(config).to.deep.equal({
      eject: false,
      projectRoot: '/path/to/project',
      relativePath: path.join('node_modules', 'react-scripts', 'test'),
    });
  });

  it('should throw an error when react-scripts could not be found', () => {
    // Arrange
    const error: NodeJS.ErrnoException = new Error('');
    error.code = 'MODULE_NOT_FOUND';
    requireResolveStub.throws(error);

    // Act & Assert
    expect(() => sut.loadConfig()).throws(
      'Unable to locate package react-scripts. This package is required when projectType is set to "create-react-app".'
    );
  });
});
