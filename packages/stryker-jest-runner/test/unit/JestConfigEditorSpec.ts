import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import JestConfigEditor from '../../src/JestConfigEditor';
import CustomJestConfigLoader, * as defaultJestConfigLoader from '../../src/configLoaders/CustomJestConfigLoader';
import ReactScriptsJestConfigLoader, * as reactScriptsJestConfigLoader from '../../src/configLoaders/ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader, * as reactScriptsTSJestConfigLoader from '../../src/configLoaders/ReactScriptsTSJestConfigLoader';
import { Configuration } from 'jest';
import currentLogMock from '../helpers/logMock';

describe('JestConfigEditor', () => {
  let sut: JestConfigEditor;
  let customConfigLoaderStub: ConfigLoaderStub;
  let reactScriptsJestConfigLoaderStub: ConfigLoaderStub;
  let reactScriptsTSJestConfigLoaderStub: ConfigLoaderStub;
  let config: Config;

  beforeEach(() => {
    customConfigLoaderStub = sinon.createStubInstance(CustomJestConfigLoader);
    reactScriptsJestConfigLoaderStub = sinon.createStubInstance(ReactScriptsJestConfigLoader);
    reactScriptsTSJestConfigLoaderStub = sinon.createStubInstance(ReactScriptsTSJestConfigLoader);

    sinon.stub(defaultJestConfigLoader, 'default').returns(customConfigLoaderStub);
    sinon.stub(reactScriptsJestConfigLoader, 'default').returns(reactScriptsJestConfigLoaderStub);
    sinon.stub(reactScriptsTSJestConfigLoader, 'default').returns(reactScriptsTSJestConfigLoaderStub);

    const defaultOptions: Partial<Configuration> = { collectCoverage: true, verbose: true, bail: false, testResultsProcessor: 'someResultProcessor' };
    customConfigLoaderStub.loadConfig.returns(defaultOptions);
    reactScriptsJestConfigLoaderStub.loadConfig.returns(defaultOptions);
    reactScriptsTSJestConfigLoaderStub.loadConfig.returns(defaultOptions);

    sut = new JestConfigEditor();
    config = new Config();
  });

  it('should call the defaultConfigLoader loadConfig method when no projectType is defined', () => {
    sut.edit(config);

    expect(config.testRunner.settings && config.testRunner.settings.projectType).eq('custom');
    assert(customConfigLoaderStub.loadConfig.calledOnce, 'CustomConfigLoader loadConfig not called');
  });

  it('should call the ReactScriptsJestConfigLoader loadConfig method when \'react\' is defined as projectType', () => {
    config.set({ testRunner: { name: 'jest', settings: { projectType: 'react' } } });

    sut.edit(config);

    assert(reactScriptsJestConfigLoaderStub.loadConfig.calledOnce, 'ReactScriptsJestConfigLoader loadConfig not called');
  });

  it('should call the ReactScriptsTSJestConfigLoader loadConfig method when \'react-ts\' is defined as projectType', () => {
    config.set({ testRunner: { name: 'jest', settings: { projectType: 'react-ts' } } });

    sut.edit(config);

    assert(reactScriptsTSJestConfigLoaderStub.loadConfig.calledOnce, 'ReactScriptsTSJestConfigLoader loadConfig not called');
  });

  it('should override verbose, collectCoverage, testResultsProcessor and bail on all loaded configs', () => {
    sut.edit(config);

    expect(config.testRunner.settings && config.testRunner.settings.config).to.deep.equal({
      bail: false,
      collectCoverage: false,
      testResultsProcessor: undefined,
      verbose: false
    });
  });

  it('should throw an error when an invalid projectType is defined', () => {
    const projectType = 'invalidProject';
    config.set({ testRunner: { name: 'jest', settings: { projectType } } });

    expect(() => sut.edit(config)).to.throw(Error, `No configLoader available for ${projectType}`);
  });

  it('should warn when using deprecated `project` property', () => {
    const projectType = 'custom';
    config.set({ testRunner: { name: 'jest', settings: { project: projectType } } });
    sut.edit(config);
    expect(currentLogMock().warn).calledWith('DEPRECATED: `jest.project` is renamed to `jest.projectType`. Please change it in your stryker configuration.');
    expect(config.testRunner.settings && config.testRunner.settings.projectType).eq(projectType);
  });

  it('should warn when using deprecated "default" project type', () => {
    const projectType = 'default';
    config.set({ testRunner: { name: 'jest', settings: { projectType } } });
    sut.edit(config);
    expect(currentLogMock().warn).calledWith('DEPRECATED: The \'default\' `jest.projectType` is renamed to \'custom\'. Please rename it in your stryker configuration.');
    expect(config.testRunner.settings && config.testRunner.settings.projectType).eq('custom');
  });
});

interface ConfigLoaderStub {
  loadConfig: sinon.SinonStub;
}
