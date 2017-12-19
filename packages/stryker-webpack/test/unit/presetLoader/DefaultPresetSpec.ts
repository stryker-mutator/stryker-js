import DefaultPreset from '../../../src/presetLoader/DefaultPreset';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';
import * as path from 'path';

describe('DefaultPreset', () => {
  let defaultPreset: DefaultPreset;
  let sandbox: sinon.SinonSandbox;
  let loaderStub: sinon.SinonStub;

  let loader: any = {
    require: () => {}
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    
    loaderStub = sandbox.stub(loader, 'require').callsFake(fakeRequire);

    defaultPreset = new DefaultPreset(loader.require);
  });

  beforeEach(() => sandbox.restore());

  it('should load the webpack configuration file from the project root when available', () => {
    // We want the method to return the return the same config as fakeRequire
    const expectedWebpackConfig = fakeRequire('/path/to/project');

    const actualWebpackConfig = defaultPreset.getWebpackConfig('/path/to/project');

    expect(actualWebpackConfig).to.deep.equal(expectedWebpackConfig);
  });

  it('should return a sensible default webpack configuration when there is no webpack config in the projectroot', () => {
    const projectRoot = '/path/to/project/without/webpack/config';
    const webpackConfig = defaultPreset.getWebpackConfig(projectRoot);
    
    expect(webpackConfig).to.deep.equal({
      entry: [path.join(projectRoot, "src", "main.js")],
      output: {
        path: path.join(projectRoot, "dist"),
        filename: "bundle.js"
      }
    });
  });

  it('should call the require method with the given projectRoot and configLocation', () => {
    const projectRoot = '/path/to/project';
    const configLocation = './config/webpack.conf.js';
    const expectedPath = path.join(projectRoot, configLocation);

    defaultPreset.getWebpackConfig(projectRoot, configLocation);

    assert(loaderStub.calledWith(expectedPath), `require method not called with ${ expectedPath }`);
  });

  it('should return an empty array when calling the getInitFiles method', () => {
    expect(defaultPreset.getInitFiles('/path/to/project')).to.be.an("array").that.is.empty;
  });
});

function fakeRequire(id: string) {
  if(id === '/path/to/project/without/webpack/config/webpack.config.js') {
    throw new Error(`Cannot find module '${id}'`);
  }

  return {
    entry: './src/main.js',

    output: {
      path: 'dist',
      filename: 'bundle.js'
    }
  };
}