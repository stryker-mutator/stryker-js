import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import JestConfigEditor from '../../src/JestConfigEditor';
import DefaultJestConfigLoader, * as defaultJestConfigLoader from '../../src/configLoaders/DefaultJestConfigLoader';
import ReactScriptsJestConfigLoader, * as reactScriptsJestConfigLoader from '../../src/configLoaders/ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader, * as reactScriptsTSJestConfigLoader from '../../src/configLoaders/ReactScriptsTSJestConfigLoader';
import JestConfiguration from '../../src/configLoaders/JestConfiguration';

describe('JestConfigEditor', () => {
  let jestConfigEditor: JestConfigEditor;
  let sandbox: sinon.SinonSandbox;

  let defaultConfigLoaderStub: ConfigLoaderStub;
  let reactScriptsJestConfigLoaderStub: ConfigLoaderStub;
  let reactScriptsTSJestConfigLoaderStub: ConfigLoaderStub;
  let config: Config;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    defaultConfigLoaderStub = sinon.createStubInstance(DefaultJestConfigLoader);
    reactScriptsJestConfigLoaderStub = sinon.createStubInstance(ReactScriptsJestConfigLoader);
    reactScriptsTSJestConfigLoaderStub = sinon.createStubInstance(ReactScriptsTSJestConfigLoader);

    sandbox.stub(defaultJestConfigLoader, 'default').returns(defaultConfigLoaderStub);
    sandbox.stub(reactScriptsJestConfigLoader, 'default').returns(reactScriptsJestConfigLoaderStub);
    sandbox.stub(reactScriptsTSJestConfigLoader, 'default').returns(reactScriptsTSJestConfigLoaderStub);

    const defaultOptions: Partial<JestConfiguration> = { collectCoverage : true, verbose: true, bail: false, testResultsProcessor: 'someResultProcessor' };
    defaultConfigLoaderStub.loadConfig.returns(defaultOptions);
    reactScriptsJestConfigLoaderStub.loadConfig.returns(defaultOptions);
    reactScriptsTSJestConfigLoaderStub.loadConfig.returns(defaultOptions);

    jestConfigEditor = new JestConfigEditor();
    config = new Config();
  });

  afterEach(() => sandbox.restore());

  it('should call the defaultConfigLoader loadConfig method when no project is defined', () => {
    jestConfigEditor.edit(config);

    expect(config.jest.project).to.equal('default');
    assert(defaultConfigLoaderStub.loadConfig.calledOnce, 'DefaultConfigLoader loadConfig not called');
  });

  it('should call the ReactScriptsJestConfigLoader loadConfig method when \'react\' is defined as project', () => {
    config.set({ jest: { project: 'react' } });

    jestConfigEditor.edit(config);

    assert(reactScriptsJestConfigLoaderStub.loadConfig.calledOnce, 'ReactScriptsJestConfigLoader loadConfig not called');
  });

  it('should call the ReactScriptsTSJestConfigLoader loadConfig method when \'react-ts\' is defined as project', () => {
    config.set({ jest: { project: 'react-ts' } });

    jestConfigEditor.edit(config);

    assert(reactScriptsTSJestConfigLoaderStub.loadConfig.calledOnce, 'ReactScriptsTSJestConfigLoader loadConfig not called');
  });

  it('should override verbose, collectcoverage, testResultsProcessor and bail on all loaded configs', () => {
    jestConfigEditor.edit(config);

    expect(config.jest.config).to.deep.equal({ 
      testResultsProcessor: undefined,
      collectCoverage: false,
      verbose: false,
      bail: false
    });
  });

  it('should return an error when an invalid project is defined', () => {
    const project = 'invalidProject';
    config.set({ jest: { project } });

    expect(() => jestConfigEditor.edit(config)).to.throw(Error, `No configLoader available for ${project}`);
  });
});

interface ConfigLoaderStub {
  loadConfig: sinon.SinonStub;
}