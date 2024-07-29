import path from 'path';
import fs from 'fs';

import type { Config } from '@jest/types';
import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import type { requireResolve } from '@stryker-mutator/util';

import { CustomJestConfigLoader } from '../../../src/config-loaders/custom-jest-config-loader.js';
import { createJestOptions } from '../../helpers/producers.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/jest-runner-options-with-stryker-options.js';
import { pluginTokens } from '../../../src/plugin-di.js';
import { JestConfigWrapper } from '../../../src/utils/jest-config-wrapper.js';

describe(CustomJestConfigLoader.name, () => {
  let jestConfigWrapperMock: sinon.SinonStubbedInstance<JestConfigWrapper>;
  let options: JestRunnerOptionsWithStrykerOptions;
  let sut: CustomJestConfigLoader;
  let requireFromCwdStub: sinon.SinonStubbedMember<typeof requireResolve>;

  beforeEach(() => {
    testInjector.options.jest = createJestOptions();
    options = testInjector.options as JestRunnerOptionsWithStrykerOptions;
    requireFromCwdStub = sinon.stub();
    jestConfigWrapperMock = sinon.createStubInstance(JestConfigWrapper);
    sut = testInjector.injector
      .provideValue(pluginTokens.requireFromCwd, requireFromCwdStub)
      .provideValue(pluginTokens.jestConfigWrapper, jestConfigWrapperMock)
      .injectClass(CustomJestConfigLoader);
  });

  describe('native readInitialOptions', () => {
    it('should readInitialOptions ', async () => {
      const expectedOptions: Config.InitialOptions = { displayName: 'test' };
      jestConfigWrapperMock.readInitialOptions.resolves({ config: expectedOptions, configPath: 'my-foo-jest-config.js' });
      const actualOptions = await sut.loadConfig();
      expect(actualOptions).eq(expectedOptions);
      sinon.assert.calledOnceWithExactly(jestConfigWrapperMock.readInitialOptions, undefined, { skipMultipleConfigError: true });
    });

    it('should readInitialOptions with a custom jest config file', async () => {
      options.jest.configFile = 'my-foo-jest-config.js';
      const expectedOptions: Config.InitialOptions = { displayName: 'test' };
      jestConfigWrapperMock.readInitialOptions.resolves({ config: expectedOptions, configPath: 'my-foo-jest-config.js' });
      await sut.loadConfig();
      sinon.assert.calledOnceWithExactly(jestConfigWrapperMock.readInitialOptions, 'my-foo-jest-config.js', { skipMultipleConfigError: true });
    });

    it('should log where config was read from', async () => {
      jestConfigWrapperMock.readInitialOptions.resolves({ config: {}, configPath: path.resolve('my-foo-jest-config.js') });
      await sut.loadConfig();
      sinon.assert.calledWith(
        testInjector.logger.debug,
        'Read config from "my-foo-jest-config.js" (used native `readInitialOptions` from jest-config).',
      );
    });

    it('should log when no config file was read', async () => {
      jestConfigWrapperMock.readInitialOptions.resolves({ config: {}, configPath: null });
      await sut.loadConfig();
      sinon.assert.calledWith(testInjector.logger.debug, 'No config file read (used native `readInitialOptions` from jest-config).');
    });
  });

  describe('manual read config', () => {
    const projectRoot = process.cwd();
    let readFileStub: sinon.SinonStubbedMember<typeof fs.promises.readFile>;
    let fileExistsSyncStub: sinon.SinonStub;
    let readConfig: Config.InitialOptions;

    beforeEach(() => {
      readFileStub = sinon.stub(fs.promises, 'readFile');
      fileExistsSyncStub = sinon.stub(fs, 'existsSync');
      readConfig = { testMatch: ['exampleJestConfigValue'] };

      // Native rejects, which enables manual mode
      jestConfigWrapperMock.readInitialOptions.rejects(new Error());
    });

    it('should load the Jest configuration from the jest.config.js', async () => {
      fileExistsSyncStub.returns(true);
      requireFromCwdStub.returns(readConfig);

      const config = await sut.loadConfig();

      expect(requireFromCwdStub).calledWith(path.join(projectRoot, 'jest.config.js'));
      expect(config).to.deep.contains(readConfig);
    });

    it('should load the Jest configuration from an async function in the jest.config.js', async () => {
      fileExistsSyncStub.returns(true);
      requireFromCwdStub.returns(() => Promise.resolve(readConfig));

      const config = await sut.loadConfig();

      expect(requireFromCwdStub).calledWith(path.join(projectRoot, 'jest.config.js'));
      expect(config).to.deep.contains(readConfig);
    });

    it('should set the rootDir when no rootDir was configured jest.config.js', async () => {
      fileExistsSyncStub.returns(true);
      requireFromCwdStub.returns(readConfig);

      const config = await sut.loadConfig();

      expect(requireFromCwdStub).calledWith(path.join(projectRoot, 'jest.config.js'));
      expect(config).to.deep.contains({ rootDir: projectRoot });
    });

    it('should override the rootDir when a rootDir was configured jest.config.js', async () => {
      readConfig.rootDir = 'lib';
      fileExistsSyncStub.returns(true);
      requireFromCwdStub.returns(readConfig);
      const config = await sut.loadConfig();

      expect(requireFromCwdStub).calledWith(path.join(projectRoot, 'jest.config.js'));
      expect(config).to.deep.contains({ rootDir: path.resolve(projectRoot, 'lib') });
    });

    it('should allow users to configure a jest.config.json file as "configFile"', async () => {
      // Arrange
      fileExistsSyncStub.returns(true);
      requireFromCwdStub.returns(readConfig);
      options.jest.configFile = path.resolve(projectRoot, 'jest.config.json');

      // Act
      const config = await sut.loadConfig();

      // Assert
      expect(requireFromCwdStub).calledWith(path.join(projectRoot, 'jest.config.json'));
      expect(config).to.deep.contain(readConfig);
    });

    it('should allow users to configure a package.json file as "configFile"', async () => {
      // Arrange
      fileExistsSyncStub
        .withArgs(path.resolve(projectRoot, 'jest.config.js'))
        .returns(false)
        .withArgs(path.resolve(projectRoot, 'package.json'))
        .returns(true);
      options.jest.configFile = path.resolve(projectRoot, 'package.json');
      readFileStub.resolves(JSON.stringify({ jest: readConfig }));

      // Act
      const config = await sut.loadConfig();

      // Assert
      sinon.assert.calledWith(readFileStub, path.join(projectRoot, 'package.json'), 'utf8');
      expect(config).to.deep.contain(readConfig);
    });

    it("should fail when configured jest.config.js file doesn't exist", async () => {
      const expectedError = new Error("File doesn't exist");
      fileExistsSyncStub.returns(false);
      requireFromCwdStub.throws(expectedError);
      options.jest.configFile = 'my-custom-jest.config.js';
      await expect(sut.loadConfig()).rejectedWith(expectedError);
    });

    it("should fail when configured package.json file doesn't exist", async () => {
      const expectedError = new Error("File doesn't exist");
      fileExistsSyncStub.returns(false);
      readFileStub.rejects(expectedError);
      options.jest.configFile = 'client/package.json';
      await expect(sut.loadConfig()).rejectedWith(expectedError);
    });

    it('should fallback and load the Jest configuration from the package.json when jest.config.js is not present in the project', async () => {
      // Arrange
      fileExistsSyncStub
        .withArgs(path.resolve(projectRoot, 'jest.config.js'))
        .returns(false)
        .withArgs(path.resolve(projectRoot, 'package.json'))
        .returns(true);
      readFileStub.resolves(JSON.stringify({ jest: readConfig }));

      // Act
      const config = await sut.loadConfig();

      // Assert
      sinon.assert.calledWith(readFileStub, path.join(projectRoot, 'package.json'), 'utf8');
      expect(config).to.deep.contain(readConfig);
    });

    it('should set the rootDir when reading config from package.json', async () => {
      // Arrange
      options.jest.configFile = 'client/package.json';
      fileExistsSyncStub
        .withArgs(path.resolve(projectRoot, 'jest.config.js'))
        .returns(false)
        .withArgs(path.resolve(projectRoot, 'client', 'package.json'))
        .returns(true);
      readFileStub.resolves(JSON.stringify({ jest: readConfig }));

      // Act
      const config = await sut.loadConfig();

      // Assert
      sinon.assert.calledWith(readFileStub, path.join(projectRoot, 'client', 'package.json'), 'utf8');
      expect(config).to.deep.contain(readConfig);
    });

    it('should load the default Jest configuration if there is no package.json config or jest.config.js', async () => {
      requireFromCwdStub.throws(Error('ENOENT: no such file or directory, open package.json'));
      readFileStub.resolves('{ }'); // note, no `jest` key here!
      const config = await sut.loadConfig();
      expect(config).to.deep.equal({});
    });
  });
});
