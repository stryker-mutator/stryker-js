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
  let sandbox: sinon.SinonSandbox;
  let requireResolveStub: sinon.SinonStub;
  let createReactJestConfigStub: sinon.SinonStub;

  const projectRoot = '/path/to/project';
  const reactScriptsPackagePath = './node_modules/react-scripts/package.json';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    createReactJestConfigStub = sandbox.stub(helper, 'createReactJestConfig');
    createReactJestConfigStub.callsFake((resolve: any, projectRoot: string, eject: boolean) => ({
      eject,
      projectRoot,
      relativePath: resolve('test')
    }));

    requireResolveStub = sandbox.stub(fakeRequire, 'resolve');
    requireResolveStub.returns(reactScriptsPackagePath);

    reactConfigLoader = new ReactScriptsJestConfigLoader(projectRoot, fakeRequire);
  });

  afterEach(() => sandbox.restore());

  it('should load the configuration via the createJestConfig method provided by react-scripts', () => {
    reactConfigLoader.loadConfig();

    assert(requireResolveStub.calledWith('react-scripts/package.json'));
  });

  it('should generate a configuration', () => {
    const config = reactConfigLoader.loadConfig();

    expect(config).to.deep.equal({
      eject: false,
      projectRoot: '/path/to/project',
      relativePath: path.join('node_modules', 'react-scripts', 'test'),
      testEnvironment: 'jsdom'
    });
  });
});
