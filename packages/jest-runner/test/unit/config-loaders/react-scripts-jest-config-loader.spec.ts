import path from 'path';

import { expect } from 'chai';
import sinon from 'sinon';
import * as utils from '@stryker-mutator/util';

import { ReactScriptsJestConfigLoader } from '../../../src/config-loaders/react-scripts-jest-config-loader';

describe(ReactScriptsJestConfigLoader.name, () => {
  let sut: ReactScriptsJestConfigLoader;
  let requireResolveStub: sinon.SinonStub;
  let resolveStub: sinon.SinonStub;
  let createReactJestConfigStub: sinon.SinonStub;

  beforeEach(() => {
    requireResolveStub = sinon.stub(utils, 'requireResolve');
    createReactJestConfigStub = sinon.stub();
    requireResolveStub.returns(createReactJestConfigStub);
    createReactJestConfigStub.returns({ testPaths: ['example'] });
    resolveStub = sinon.stub();
    resolveStub.returns(path.resolve('./node_modules/react-scripts/package.json'));
    sut = new ReactScriptsJestConfigLoader(resolveStub as unknown as RequireResolve);
  });

  it('should load the configuration via the createJestConfig method provided by react-scripts', () => {
    const config = sut.loadConfig();

    expect(resolveStub).calledWith('react-scripts/package.json');
    expect(requireResolveStub).calledWith('react-scripts/scripts/utils/createJestConfig');
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
});
