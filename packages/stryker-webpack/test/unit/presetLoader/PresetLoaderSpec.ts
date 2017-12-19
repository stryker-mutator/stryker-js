import PresetLoader from '../../../src/presetLoader/PresetLoader';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';
import WebpackPreset from '../../../src/presetLoader/WebpackPreset';
import DefaultPreset, * as defaultPreset from '../../../src/presetLoader/DefaultPreset';

describe('PresetLoader', () => {
  let presetLoader: PresetLoader;
  let sandbox: sinon.SinonSandbox;

  // Stubs
  let requireStub: sinon.SinonStub;
  let defaultPresetStub: DefaultPresetStub;

  let loader: any = {
    require: () => {}
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    defaultPresetStub = sinon.createStubInstance(DefaultPreset);

    sandbox.stub(defaultPreset, 'default').returns(defaultPresetStub);
    requireStub = sandbox.stub(loader, 'require').callsFake(fakeRequire);

    presetLoader = new PresetLoader(loader.require);
  });

  afterEach(() => sandbox.restore());

  it('should return a WebpackPreset when it exists', () => {
    const webpackPreset: WebpackPreset = presetLoader.loadPreset('angular');

    expect(webpackPreset).to.have.property('getWebpackConfig');
    expect(webpackPreset).to.have.property('getInitFiles');    
  });

  it('should return an error when \'getInitFiles\' is not present on the required module', () => {
    requireStub.returns({ 
      default: class {
        getWebpackConfig() {};
      }
    });

    expect(() => presetLoader.loadPreset('angular')).to.throw(Error, `Cannot find property 'getInitFiles' on 'stryker-webpack-angular-preset'`);
  });

  it('should return an error when \'getWebpackConfig\' is not present on the required module', () => {
    requireStub.returns({ 
      default: class {
        getInitFiles() {};
      }
    });

    expect(() => presetLoader.loadPreset('angular')).to.throw(Error, `Cannot find property 'getWebpackConfig' on 'stryker-webpack-angular-preset'`);
  });

  it('should throw a warning when no preset was found', () => {
    const id = 'invalid';

    expect(() => presetLoader.loadPreset(id)).to.throw(Error, `Cannot find Stryker Webpack preset 'stryker-webpack-${id}-preset', try to run npm i stryker-webpack-${id}-preset to install it`);
  });

  it('should return the default preset when loadPreset is called with the parameter \'default\'', () => {
    const preset = presetLoader.loadPreset('default');
    preset.getInitFiles('/project/root');
    preset.getWebpackConfig('/project/root');
    
    assert(defaultPresetStub.getInitFiles.calledOnce, 'getInitFiles not called on DefaultPreset');
    assert(defaultPresetStub.getWebpackConfig.calledOnce, 'getWebpackConfig not called on DefaultPreset');
  });
});

function fakeRequire(id: string): any {
  if(id === 'stryker-webpack-invalid-preset') {
    throw new Error(`Cannot find module '${id}'`);
  }

  return {
    default: class {
      getWebpackConfig() {};
      getInitFiles() {};
    }
  };
}

interface DefaultPresetStub {
  getInitFiles: sinon.SinonStub;
  getWebpackConfig: sinon.SinonStub;
}