import { assert, expect } from 'chai';
import path from 'path';
import sinon from 'sinon';
import ReactScriptsTSJestConfigLoader from '../../../src/configLoaders/ReactScriptsTSJestConfigLoader';
import * as helper from '../../../src/utils/createReactJestConfig';

const fakeRequire: any = {
  resolve: () => { }
};

describe('ReactScriptsTsJestConfigLoader', () => {
  let reactConfigLoader: ReactScriptsTSJestConfigLoader;
  let requireResolveStub: sinon.SinonStub;
  let createReactJestConfigStub: sinon.SinonStub;

  const projectRoot = '/path/to/project';
  const reactScriptsTsPackagePath = './node_modules/react-scripts-ts/package.json';

  beforeEach(() => {
    createReactJestConfigStub = sinon.stub(helper, 'createReactTsJestConfig');
    createReactJestConfigStub.callsFake((resolve: any, projectRoot: string, eject: boolean) => ({
      eject,
      projectRoot,
      relativePath: resolve('test')
    }));

    requireResolveStub = sinon.stub(fakeRequire, 'resolve');
    requireResolveStub.returns(reactScriptsTsPackagePath);

    reactConfigLoader = new ReactScriptsTSJestConfigLoader(projectRoot, fakeRequire);
  });

  it('should load the configuration via the createJestConfig method provided by react-scripts-ts', () => {
    reactConfigLoader.loadConfig();

    assert(requireResolveStub.calledWith('react-scripts-ts/package.json'));
  });

  it('should generate a configuration', () => {
    const config = reactConfigLoader.loadConfig();

    expect(config).to.deep.equal({
      eject: false,
      projectRoot: '/path/to/project',
      relativePath: path.join('node_modules', 'react-scripts-ts', 'test'),
      testEnvironment: 'jsdom'
    });
  });
});
