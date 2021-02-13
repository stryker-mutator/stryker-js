import childProcess from 'child_process';
import fs from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { childProcessAsPromised, normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';
import inquirer from 'inquirer';
import sinon from 'sinon';
import { IRestResponse, RestClient } from 'typed-rest-client/RestClient';

import { initializerTokens } from '../../../src/initializer';
import { GitignoreWriter } from '../../../src/initializer/gitignore-writer';
import { NpmClient } from '../../../src/initializer/npm-client';
import { PackageInfo } from '../../../src/initializer/package-info';
import { Preset } from '../../../src/initializer/presets/preset';
import { PresetConfiguration } from '../../../src/initializer/presets/preset-configuration';
import { StrykerConfigWriter } from '../../../src/initializer/stryker-config-writer';
import { StrykerInitializer } from '../../../src/initializer/stryker-initializer';
import { StrykerInquirer } from '../../../src/initializer/stryker-inquirer';
import { Mock } from '../../helpers/producers';

describe(StrykerInitializer.name, () => {
  let sut: StrykerInitializer;
  let inquirerPrompt: sinon.SinonStub;
  let childExecSync: sinon.SinonStub;
  let childExec: sinon.SinonStub;
  let fsWriteFile: sinon.SinonStub;
  let fsExistsSync: sinon.SinonStub;
  let restClientPackage: sinon.SinonStubbedInstance<RestClient>;
  let restClientSearch: sinon.SinonStubbedInstance<RestClient>;
  let gitignoreWriter: sinon.SinonStubbedInstance<GitignoreWriter>;
  let out: sinon.SinonStub;
  let presets: Preset[];
  let presetMock: Mock<Preset>;

  beforeEach(() => {
    out = sinon.stub();
    presets = [];
    presetMock = {
      createConfig: sinon.stub(),
      name: 'awesome-preset',
    };
    childExec = sinon.stub(childProcessAsPromised, 'exec');
    inquirerPrompt = sinon.stub(inquirer, 'prompt');
    childExecSync = sinon.stub(childProcess, 'execSync');
    fsWriteFile = sinon.stub(fs.promises, 'writeFile');
    fsExistsSync = sinon.stub(fs, 'existsSync');
    restClientSearch = sinon.createStubInstance(RestClient);
    restClientPackage = sinon.createStubInstance(RestClient);
    gitignoreWriter = sinon.createStubInstance(GitignoreWriter);
    sut = testInjector.injector
      .provideValue(initializerTokens.out, (out as unknown) as typeof console.log)
      .provideValue(initializerTokens.restClientNpm, (restClientPackage as unknown) as RestClient)
      .provideValue(initializerTokens.restClientNpmSearch, (restClientSearch as unknown) as RestClient)
      .provideClass(initializerTokens.inquirer, StrykerInquirer)
      .provideClass(initializerTokens.npmClient, NpmClient)
      .provideValue(initializerTokens.strykerPresets, presets)
      .provideClass(initializerTokens.configWriter, StrykerConfigWriter)
      .provideValue(initializerTokens.gitignoreWriter, (gitignoreWriter as unknown) as GitignoreWriter)
      .injectClass(StrykerInitializer);
  });

  describe('initialize()', () => {
    beforeEach(() => {
      stubTestRunners('@stryker-mutator/awesome-runner', 'stryker-hyper-runner', 'stryker-ghost-runner');
      stubMutators('@stryker-mutator/typescript', '@stryker-mutator/javascript-mutator');
      stubReporters('stryker-dimension-reporter', '@stryker-mutator/mars-reporter');
      stubPackageClient({
        '@stryker-mutator/awesome-runner': null,
        '@stryker-mutator/javascript-mutator': null,
        '@stryker-mutator/mars-reporter': null,
        '@stryker-mutator/typescript': null,
        '@stryker-mutator/webpack': null,
        'stryker-dimension-reporter': null,
        'stryker-ghost-runner': null,
        'stryker-hyper-runner': {
          files: [],
          someOtherSetting: 'enabled',
        },
      });
      fsWriteFile.resolves({});
      presets.push(presetMock);
    });

    it('should prompt for preset, test runner, reporters, package manager and config type', async () => {
      arrangeAnswers({
        packageManager: 'yarn',
        reporters: ['dimension', 'mars'],
        testRunner: 'awesome',
      });

      await sut.initialize();

      expect(inquirerPrompt).callCount(5);
      const [promptPreset, promptTestRunner, promptReporters, promptPackageManagers, promptConfigTypes]: inquirer.ListQuestion[] = [
        inquirerPrompt.getCall(0).args[0],
        inquirerPrompt.getCall(1).args[0],
        inquirerPrompt.getCall(2).args[0],
        inquirerPrompt.getCall(3).args[0],
        inquirerPrompt.getCall(4).args[0],
      ];
      expect(promptPreset.type).to.eq('list');
      expect(promptPreset.name).to.eq('preset');
      expect(promptPreset.choices).to.deep.eq(['awesome-preset', new inquirer.Separator(), 'None/other']);
      expect(promptTestRunner.type).to.eq('list');
      expect(promptTestRunner.name).to.eq('testRunner');
      expect(promptTestRunner.choices).to.deep.eq(['awesome', 'hyper', 'ghost', new inquirer.Separator(), 'command']);
      expect(promptReporters.type).to.eq('checkbox');
      expect(promptReporters.choices).to.deep.eq(['dimension', 'mars', 'html', 'clear-text', 'progress', 'dashboard']);
      expect(promptPackageManagers.type).to.eq('list');
      expect(promptPackageManagers.choices).to.deep.eq(['npm', 'yarn']);
      expect(promptConfigTypes.type).to.eq('list');
      expect(promptConfigTypes.choices).to.deep.eq(['JSON', 'JavaScript']);
    });

    it('should immediately complete when a preset and package manager is chosen', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset',
        configType: 'JSON',
      });
      resolvePresetConfig();
      await sut.initialize();
      expect(inquirerPrompt).callCount(3);
      expect(out).calledWith('Done configuring stryker. Please review "stryker.conf.json", you might need to configure your test runner correctly.');
      expect(out).calledWith("Let's kill some mutants with this command: `stryker run`");
    });

    it('should correctly write and format the stryker js configuration file', async () => {
      const guideUrl = 'https://awesome-preset.org';
      const config = { awesomeConf: 'awesome' };
      childExec.resolves();
      resolvePresetConfig({
        config,
        guideUrl,
      });
      const expectedOutput = `/**
         * @type {import('@stryker-mutator/api/core').StrykerOptions}
         */  
        module.exports = {
          "_comment": "This config was generated using 'stryker init'. Please see the guide for more information: https://awesome-preset.org",
          "awesomeConf": "${config.awesomeConf}"
        };`;
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset',
        configType: 'JavaScript',
      });
      await sut.initialize();
      expectStrykerConfWritten(expectedOutput);
      expect(childExec).calledWith('npx prettier --write stryker.conf.js');
    });

    it('should handle errors when formatting fails', async () => {
      // Arrange
      const expectedError = new Error('Formatting fails');
      childExec.rejects(expectedError);
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset',
        configType: 'JavaScript',
      });
      resolvePresetConfig();

      // Act
      await sut.initialize();

      // Assert
      expect(out).calledWith('Unable to format stryker.conf.js file for you. This is not a big problem, but it might look a bit messy 🙈.');
      expect(testInjector.logger.debug).calledWith('Prettier exited with error', expectedError);
    });

    it('should correctly load dependencies from the preset', async () => {
      resolvePresetConfig({ dependencies: ['my-awesome-dependency', 'another-awesome-dependency'] });
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(fsWriteFile).calledOnce;
      expect(childExecSync).calledWith('npm i --save-dev my-awesome-dependency another-awesome-dependency', { stdio: [0, 1, 2] });
    });

    it('should correctly load configuration from a preset', async () => {
      resolvePresetConfig();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(inquirerPrompt).callCount(3);
      const [promptPreset, promptConfigType, promptPackageManager]: inquirer.ListQuestion[] = [
        inquirerPrompt.getCall(0).args[0],
        inquirerPrompt.getCall(1).args[0],
        inquirerPrompt.getCall(2).args[0],
      ];
      expect(promptPreset.type).to.eq('list');
      expect(promptPreset.name).to.eq('preset');
      expect(promptPreset.choices).to.deep.eq(['awesome-preset', new inquirer.Separator(), 'None/other']);
      expect(promptConfigType.type).to.eq('list');
      expect(promptConfigType.choices).to.deep.eq(['JSON', 'JavaScript']);
      expect(promptPackageManager.type).to.eq('list');
      expect(promptPackageManager.choices).to.deep.eq(['npm', 'yarn']);
    });

    it('should install any additional dependencies', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['dimension', 'mars'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(out).calledWith('Installing NPM dependencies...');
      expect(childExecSync).calledWith('npm i --save-dev @stryker-mutator/awesome-runner stryker-dimension-reporter @stryker-mutator/mars-reporter', {
        stdio: [0, 1, 2],
      });
    });

    it('should configure testRunner, reporters, and packageManager', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['dimension', 'mars', 'progress'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(fsWriteFile).calledOnce;
      const [fileName, content] = fsWriteFile.getCall(0).args;
      expect(fileName).eq('stryker.conf.json');
      const normalizedContent = normalizeWhitespaces(content);
      expect(normalizedContent).contains('"testRunner": "awesome"');
      expect(normalizedContent).contains('"packageManager": "npm"');
      expect(normalizedContent).contains('"coverageAnalysis": "perTest"');
      expect(normalizedContent).contains('"dimension", "mars", "progress"');
    });

    it('should configure the additional settings from the plugins', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'hyper',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(fs.promises.writeFile).calledWith('stryker.conf.json', sinon.match('"someOtherSetting": "enabled"'));
      expect(fs.promises.writeFile).calledWith('stryker.conf.json', sinon.match('"files": []'));
    });

    it('should set "coverageAnalysis" to "off" when the command test runner is chosen', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'command',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(fs.promises.writeFile).calledWith('stryker.conf.json', sinon.match('"coverageAnalysis": "off"'));
    });

    it('should reject with that error', () => {
      const expectedError = new Error('something');
      fsWriteFile.rejects(expectedError);
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'ghost',
        configType: 'JSON',
      });

      return expect(sut.initialize()).to.eventually.be.rejectedWith(expectedError);
    });

    it('should recover when install fails', async () => {
      childExecSync.throws('error');
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'ghost',
        configType: 'JSON',
      });

      await sut.initialize();

      expect(out).calledWith('An error occurred during installation, please try it yourself: "npm i --save-dev stryker-ghost-runner"');
      expect(fs.promises.writeFile).called;
    });
  });

  describe('initialize() when no internet', () => {
    it('should log error and continue when fetching test runners', async () => {
      restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/test-runner-plugin').rejects();
      stubMutators('stryker-javascript');
      stubReporters();
      stubPackageClient({ 'stryker-javascript': null, 'stryker-webpack': null });
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        configType: 'JSON',
      });

      await sut.initialize();

      expect(testInjector.logger.error).calledWith(
        'Unable to reach npms.io (for query /v2/search?q=keywords:@stryker-mutator/test-runner-plugin). Please check your internet connection.'
      );
      expect(fs.promises.writeFile).calledWith('stryker.conf.json', sinon.match('"testRunner": "command"'));
    });

    it('should log error and continue when fetching stryker reporters', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubMutators('stryker-javascript');
      restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/reporter-plugin').rejects();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-javascript': null, 'stryker-webpack': null });

      await sut.initialize();

      expect(testInjector.logger.error).calledWith(
        'Unable to reach npms.io (for query /v2/search?q=keywords:@stryker-mutator/reporter-plugin). Please check your internet connection.'
      );
      expect(fs.promises.writeFile).called;
    });

    it('should log warning and continue when fetching custom config', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubMutators();
      stubReporters();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      restClientPackage.get.rejects();

      await sut.initialize();

      expect(testInjector.logger.warn).calledWith(
        'Could not fetch additional initialization config for dependency stryker-awesome-runner. You might need to configure it manually'
      );
      expect(fs.promises.writeFile).called;
    });
  });

  it('should log an error and quit when `stryker.conf.js` file already exists', async () => {
    fsExistsSync.resolves(true);

    expect(sut.initialize()).to.be.rejected;
    expect(testInjector.logger.error).calledWith(
      'Stryker config file "stryker.conf.js" already exists in the current directory. Please remove it and try again.'
    );
  });

  const stubTestRunners = (...testRunners: string[]) => {
    restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/test-runner-plugin').resolves(({
      result: {
        results: testRunners.map((testRunner) => ({ package: { name: testRunner, version: '1.1.1' } })),
      },
      statusCode: 200,
    } as unknown) as IRestResponse<PackageInfo[]>);
  };

  const stubMutators = (...mutators: string[]) => {
    restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/mutator-plugin').resolves(({
      result: {
        results: mutators.map((mutator) => ({ package: { name: mutator, version: '1.1.1' } })),
      },
      statusCode: 200,
    } as unknown) as IRestResponse<PackageInfo[]>);
  };

  const stubReporters = (...reporters: string[]) => {
    restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/reporter-plugin').resolves(({
      result: {
        results: reporters.map((reporter) => ({ package: { name: reporter, version: '1.1.1' } })),
      },
      statusCode: 200,
    } as unknown) as IRestResponse<PackageInfo[]>);
  };
  const stubPackageClient = (packageConfigPerPackage: Record<string, Record<string, unknown> | null>) => {
    Object.keys(packageConfigPerPackage).forEach((packageName) => {
      const pkgConfig: PackageInfo & { initStrykerConfig?: Record<string, unknown> } = {
        keywords: [],
        name: packageName,
        version: '1.1.1',
      };
      const cfg = packageConfigPerPackage[packageName];
      if (cfg) {
        pkgConfig.initStrykerConfig = cfg;
      }
      restClientPackage.get.withArgs(`/${packageName}@1.1.1/package.json`).resolves(({
        result: pkgConfig,
        statusCode: 200,
      } as unknown) as IRestResponse<PackageInfo[]>);
    });
  };

  interface StrykerInitAnswers {
    preset: string | null;
    testRunner: string;
    reporters: string[];
    packageManager: string;
  }

  function arrangeAnswers(answerOverrides?: Partial<StrykerInitAnswers>) {
    const answers: StrykerInitAnswers = Object.assign(
      {
        packageManager: 'yarn',
        preset: null,
        reporters: ['dimension', 'mars'],
        testRunner: 'awesome',
      },
      answerOverrides
    );
    inquirerPrompt.resolves(answers);
  }

  function resolvePresetConfig(presetConfigOverrides?: Partial<PresetConfiguration>) {
    const presetConfig: PresetConfiguration = {
      config: {},
      dependencies: [],
      guideUrl: '',
    };
    presetMock.createConfig.resolves(Object.assign({}, presetConfig, presetConfigOverrides));
  }

  function expectStrykerConfWritten(expectedRawConfig: string) {
    const [fileName, actualConfig] = fsWriteFile.getCall(0).args;
    expect(fileName).eq('stryker.conf.js');
    expect(normalizeWhitespaces(actualConfig)).deep.eq(normalizeWhitespaces(expectedRawConfig));
  }
});
