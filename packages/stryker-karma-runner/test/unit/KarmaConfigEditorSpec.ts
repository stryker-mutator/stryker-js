import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import * as logging from 'stryker-api/logging';
import KarmaConfigEditor from '../../src/KarmaConfigEditor';
import LoggerStub from '../helpers/LoggerStub';

describe('KarmaConfigEditor', () => {
  let sut: KarmaConfigEditor;
  let config: Config;
  let logMock: LoggerStub;

  beforeEach(() => {
    logMock = new LoggerStub();
    sandbox.stub(logging, 'getLogger').returns(logMock);
    sut = new KarmaConfigEditor();
    config = new Config();
  });

  it('should warn when using deprecated `karma` property', () => {
    const projectType = 'custom';
    config.set({ karma: { projectType } });
    sut.edit(config);
    expect(logMock.warn).calledWith('DEPRECATED: "karma" is renamed to "testRunner.settings". Please change it in your stryker configuration.');
    const expectedSettings = config.testRunner.settings || {};
    expect(expectedSettings.projectType).eq(projectType);
  });

  it('should warn when using deprecated `karmaConfig` property', () => {
    const expectedKarmaConfig = { basePath: 'foobar' };
    config.set({ karmaConfig: expectedKarmaConfig });
    sut.edit(config);
    expect(logMock.warn).calledWith('DEPRECATED: "karmaConfig" is renamed to "testRunner.settings.config". Please change it in your stryker configuration.');
    const expectedSettings = config.testRunner.settings || {};
    expect(expectedSettings.config).eq(expectedKarmaConfig);
  });

  it('should warn when using deprecated `karmaConfigFile` property', () => {
    const expectedKarmaConfigFile = 'karmaConfigFile';
    config.set({ karmaConfigFile: expectedKarmaConfigFile });
    sut.edit(config);
    expect(logMock.warn).calledWith('DEPRECATED: "karmaConfigFile" is renamed to "testRunner.settings.configFile". Please change it in your stryker configuration.');
    const expectedSettings = config.testRunner.settings || {};
    expect(expectedSettings.configFile).eq(expectedKarmaConfigFile);
  });
});
