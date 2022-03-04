import fs from 'fs';
import path from 'path';

import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import type { requireResolve } from '@stryker-mutator/util';
import type { Config } from '@jest/types';

import { CustomJestConfigLoader } from '../../../src/config-loaders/custom-jest-config-loader.js';
import * as pluginTokens from '../../../src/plugin-tokens.js';
import { createJestOptions } from '../../helpers/producers.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/jest-runner-options-with-stryker-options.js';

describe(CustomJestConfigLoader.name, () => {
  let sut: CustomJestConfigLoader;
  const projectRoot = process.cwd();
  let readFileSyncStub: sinon.SinonStub;
  let fileExistsSyncStub: sinon.SinonStub;
  let requireFromCwdStub: sinon.SinonStubbedMember<typeof requireResolve>;
  let readConfig: Config.InitialOptions;
  let options: JestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    fileExistsSyncStub = sinon.stub(fs, 'existsSync');
    requireFromCwdStub = sinon.stub();

    readConfig = { testMatch: ['exampleJestConfigValue'] };
    readFileSyncStub.callsFake(() => `{ "jest": ${JSON.stringify(readConfig)}}`);
    requireFromCwdStub.returns(readConfig);
    testInjector.options.jest = createJestOptions();
    options = testInjector.options as JestRunnerOptionsWithStrykerOptions;
    sut = testInjector.injector.provideValue(pluginTokens.requireFromCwd, requireFromCwdStub).injectClass(CustomJestConfigLoader);
  });

  it('should load the Jest configuration from the jest.config.js', () => {
    fileExistsSyncStub.returns(true);
    const config = sut.loadConfig();

    expect(requireFromCwdStub).calledWith(path.join(projectRoot, 'jest.config.js'));
    expect(config).to.deep.contains(readConfig);
  });

  it('should set the rootDir when no rootDir was configured jest.config.js', () => {
    fileExistsSyncStub.returns(true);
    const config = sut.loadConfig();

    expect(requireFromCwdStub).calledWith(path.join(projectRoot, 'jest.config.js'));
    expect(config).to.deep.contains({ rootDir: projectRoot });
  });

  it('should override the rootDir when a rootDir was configured jest.config.js', () => {
    readConfig.rootDir = 'lib';
    fileExistsSyncStub.returns(true);
    const config = sut.loadConfig();

    expect(requireFromCwdStub).calledWith(path.join(projectRoot, 'jest.config.js'));
    expect(config).to.deep.contains({ rootDir: path.resolve(projectRoot, 'lib') });
  });

  it('should allow users to configure a jest.config.json file as "configFile"', () => {
    // Arrange
    fileExistsSyncStub.returns(true);
    options.jest.configFile = path.resolve(projectRoot, 'jest.config.json');

    // Act
    const config = sut.loadConfig();

    // Assert
    expect(requireFromCwdStub).calledWith(path.join(projectRoot, 'jest.config.json'));
    expect(config).to.deep.contain(readConfig);
  });

  it('should allow users to configure a package.json file as "configFile"', () => {
    // Arrange
    fileExistsSyncStub
      .withArgs(path.resolve(projectRoot, 'jest.config.js'))
      .returns(false)
      .withArgs(path.resolve(projectRoot, 'package.json'))
      .returns(true);
    options.jest.configFile = path.resolve(projectRoot, 'package.json');

    // Act
    const config = sut.loadConfig();

    // Assert
    expect(readFileSyncStub).calledWith(path.join(projectRoot, 'package.json'), 'utf8');
    expect(config).to.deep.contain(readConfig);
  });

  it("should fail when configured jest.config.js file doesn't exist", () => {
    const expectedError = new Error("File doesn't exist");
    fileExistsSyncStub.returns(false);
    requireFromCwdStub.throws(expectedError);
    options.jest.configFile = 'my-custom-jest.config.js';
    expect(sut.loadConfig.bind(sut)).throws(expectedError);
  });

  it("should fail when configured package.json file doesn't exist", () => {
    const expectedError = new Error("File doesn't exist");
    fileExistsSyncStub.returns(false);
    readFileSyncStub.throws(expectedError);
    options.jest.configFile = 'client/package.json';
    expect(sut.loadConfig.bind(sut)).throws(expectedError);
  });

  it('should fallback and load the Jest configuration from the package.json when jest.config.js is not present in the project', () => {
    // Arrange
    fileExistsSyncStub
      .withArgs(path.resolve(projectRoot, 'jest.config.js'))
      .returns(false)
      .withArgs(path.resolve(projectRoot, 'package.json'))
      .returns(true);

    // Act
    const config = sut.loadConfig();

    // Assert
    expect(readFileSyncStub).calledWith(path.join(projectRoot, 'package.json'), 'utf8');
    expect(config).to.deep.contain(readConfig);
  });

  it('should set the rootDir when reading config from package.json', () => {
    // Arrange
    options.jest.configFile = 'client/package.json';
    fileExistsSyncStub
      .withArgs(path.resolve(projectRoot, 'jest.config.js'))
      .returns(false)
      .withArgs(path.resolve(projectRoot, 'client', 'package.json'))
      .returns(true);

    // Act
    const config = sut.loadConfig();

    // Assert
    expect(readFileSyncStub).calledWith(path.join(projectRoot, 'client', 'package.json'), 'utf8');
    expect(config).to.deep.contain(readConfig);
  });

  it('should load the default Jest configuration if there is no package.json config or jest.config.js', () => {
    requireFromCwdStub.throws(Error('ENOENT: no such file or directory, open package.json'));
    readFileSyncStub.returns('{ }'); // note, no `jest` key here!
    const config = sut.loadConfig();
    expect(config).to.deep.equal({});
  });
});
