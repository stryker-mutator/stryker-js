import DefaultPreset from '../../../src/presetLoader/DefaultPreset';
import * as sinon from 'sinon';
import { expect } from 'chai';
import * as path from 'path';

describe('DefaultPreset', () => {
  let defaultPreset: DefaultPreset;
  let sandbox: sinon.SinonSandbox;
  let loaderStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    loaderStub = sandbox.stub();

    defaultPreset = new DefaultPreset(loaderStub);
  });

  beforeEach(() => sandbox.restore());

  it('should load the webpack configuration file from the project root when available', () => {
    // We want the method to return the return the same config as fakeRequire
    const expectedWebpackConfig = { entry: './src/main.js' };
    loaderStub.returns(expectedWebpackConfig);

    const actualWebpackConfig = defaultPreset.getWebpackConfig('/path/to/project');

    expect(actualWebpackConfig).to.deep.equal(expectedWebpackConfig);
  });

  it('should call the require method with the given projectRoot and configLocation', () => {
    const configLocation = './config/webpack.conf.js';
    const expectedPath = path.resolve(configLocation);

    defaultPreset.getWebpackConfig(configLocation);

    expect(loaderStub).calledWith(expectedPath);
  });

  it('should return an empty array when calling the getInitFiles method', () => {
    expect(defaultPreset.getInitFiles()).to.be.an('array').that.is.empty;
  });
});
