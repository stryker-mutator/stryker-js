import * as path from 'path';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import ReactScriptsJestConfigLoader from '../../../src/configLoaders/ReactScriptsJestConfigLoader';
import * as helper from '../../../src/utils/createReactJestConfig';

const fakeRequire: any = {
  resolve: () => { }
};

describe('ReactScriptsJestConfigLoader', () => {
  let reactConfigLoader: ReactScriptsJestConfigLoader;
  let requireResolveStub: sinon.SinonStub;
  let createReactJestConfigStub: sinon.SinonStub;

  let projectRoot = '/path/to/project';
  let reactScriptsPackagePath = './node_modules/react-scripts/package.json';

  beforeEach(() => {
    createReactJestConfigStub = sinon.stub(helper, 'createReactJestConfig');
    createReactJestConfigStub.callsFake((resolve: any, projectRoot: string, eject: boolean) => ({
      relativePath: resolve('test'),
      projectRoot,
      eject
    }));

    requireResolveStub = sinon.stub(fakeRequire, 'resolve');
    requireResolveStub.returns(reactScriptsPackagePath);

    reactConfigLoader = new ReactScriptsJestConfigLoader(projectRoot, fakeRequire);
  });

  it('should load the configuration via the createJestConfig method provided by react-scripts', () => {
    reactConfigLoader.loadConfig();

    assert(requireResolveStub.calledWith('react-scripts/package.json'));
  });

  it('should generate a configuration', () => {
    const config = reactConfigLoader.loadConfig();

    expect(config).to.deep.equal({
      relativePath: path.join('node_modules', 'react-scripts', 'test'),
      projectRoot: '/path/to/project',
      eject: false,
      testEnvironment: 'jsdom'
    });
  });
});