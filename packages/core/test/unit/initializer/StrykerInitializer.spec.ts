import * as child from 'child_process';
import * as fs from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { childProcessAsPromised, normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as inquirer from 'inquirer';
import * as sinon from 'sinon';
import { RestClient } from 'typed-rest-client/RestClient';

import { initializerTokens } from '../../../src/initializer';
import NpmClient from '../../../src/initializer/NpmClient';
import { PackageInfo } from '../../../src/initializer/PackageInfo';
import Preset from '../../../src/initializer/presets/Preset';
import PresetConfiguration from '../../../src/initializer/presets/PresetConfiguration';
import StrykerConfigWriter from '../../../src/initializer/StrykerConfigWriter';
import StrykerInitializer from '../../../src/initializer/StrykerInitializer';
import { StrykerInquirer } from '../../../src/initializer/StrykerInquirer';
import { Mock } from '../../helpers/producers';
import GitignoreWriter from '../../../src/initializer/GitignoreWriter';

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
    childExecSync = sinon.stub(child, 'execSync');
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
        '@stryker-mutator/awesome-framework': null,
        '@stryker-mutator/awesome-runner': null,
        '@stryker-mutator/javascript-mutator': null,
        '@stryker-mutator/mars-reporter': null,
        '@stryker-mutator/typescript': null,
        '@stryker-mutator/webpack': null,
        'stryker-dimension-reporter': null,
        'stryker-ghost-runner': null,
        'stryker-hyper-framework': null,
        'stryker-hyper-runner': {
          files: [],
          someOtherSetting: 'enabled',
        },
      });
      fsWriteFile.resolves({});
      presets.push(presetMock);
    });

    it('should prompt for preset, test runner, mutator, reporters, package manager and config type', async () => {
      arrangeAnswers({
        mutator: 'typescript',
        packageManager: 'yarn',
        reporters: ['dimension', 'mars'],
        testRunner: 'awesome',
      });

      await sut.initialize();

      expect(inquirerPrompt).callCount(6);
      const [promptPreset, promptTestRunner, promptMutator, promptPackageManagers, promptConfigTypes]: Array<inquirer.ListQuestion<string>> = [
        inquirerPrompt.getCall(0).args[0],
        inquirerPrompt.getCall(1).args[0],
        inquirerPrompt.getCall(2).args[0],
        inquirerPrompt.getCall(3).args[0],
        inquirerPrompt.getCall(4).args[0],
      ];
      const promptReporters: inquirer.CheckboxQuestion<string> = inquirerPrompt.getCall(5).args[0];
      expect(promptPreset.type).to.eq('list');
      expect(promptPreset.name).to.eq('preset');
      expect(promptPreset.choices).to.deep.eq(['awesome-preset', new inquirer.Separator(), 'None/other']);
      expect(promptTestRunner.type).to.eq('list');
      expect(promptTestRunner.name).to.eq('testRunner');
      expect(promptTestRunner.choices).to.deep.eq(['awesome', 'hyper', 'ghost', new inquirer.Separator(), 'command']);
      expect(promptMutator.type).to.eq('list');
      expect(promptMutator.choices).to.deep.eq(['typescript', 'javascript']);
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
      const handbookUrl = 'https://awesome-preset.org';
      const config = {
        comment: `This config was generated using a preset. Please see the handbook for more information: ${handbookUrl}`,
        awesomeConf: 'awesome',
      };
      childExec.resolves();
      resolvePresetConfig({
        config,
        handbookUrl,
      });
      const expectedOutput = `/**
         * @type {import('@stryker-mutator/api/core').StrykerOptions}
         */  
        module.exports = {
          "comment": "${config.comment}",
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
      const [promptPreset, promptConfigType, promptPackageManager]: Array<inquirer.ListQuestion<string>> = [
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
        mutator: 'typescript',
        packageManager: 'npm',
        reporters: ['dimension', 'mars'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(out).calledWith('Installing NPM dependencies...');
      expect(
        childExecSync
      ).calledWith(
        'npm i --save-dev @stryker-mutator/awesome-runner @stryker-mutator/typescript stryker-dimension-reporter @stryker-mutator/mars-reporter',
        { stdio: [0, 1, 2] }
      );
    });

    it('should configure testRunner, mutator, reporters, and packageManager', async () => {
      inquirerPrompt.resolves({
        mutator: 'typescript',
        packageManager: 'npm',
        reporters: ['dimension', 'mars', 'progress'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      await sut.initialize();
      const matchNormalized = (expected: string) =>
        sinon.match((actual: string) => normalizeWhitespaces(actual).includes(normalizeWhitespaces(expected)));
      expect(fs.promises.writeFile).calledWith(
        'stryker.conf.json',
        matchNormalized('"testRunner": "awesome"')
          .and(matchNormalized('"packageManager": "npm"'))
          .and(matchNormalized('"coverageAnalysis": "perTest"'))
          .and(matchNormalized('"mutator": "typescript"'))
          .and(matchNormalized('"dimension", "mars", "progress"'))
      );
    });

    it('should configure the additional settings from the plugins', async () => {
      inquirerPrompt.resolves({
        mutator: 'javascript',
        packageManager: 'npm',
        reporters: [],
        testRunner: 'hyper',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(fs.promises.writeFile).calledWith('stryker.conf.json', sinon.match('"someOtherSetting": "enabled"'));
      expect(fs.promises.writeFile).calledWith('stryker.conf.json', sinon.match('"files": []'));
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
      expect(out).calledWith('Unable to select a test runner. You will need to configure it manually.');
      expect(fs.promises.writeFile).called;
    });

    it('should log error and continue when fetching test frameworks', async () => {
      stubTestRunners('stryker-awesome-runner');
      restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/test-framework-plugin').rejects();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      stubMutators('stryker-javascript');
      stubReporters();
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-javascript': null, 'stryker-webpack': null });

      await sut.initialize();

      expect(testInjector.logger.error).calledWith(
        'Unable to reach npms.io (for query /v2/search?q=keywords:@stryker-mutator/test-framework-plugin). Please check your internet connection.'
      );
      expect(out).calledWith('No stryker test framework plugin found that is compatible with awesome, downgrading coverageAnalysis to "all"');
      expect(fs.promises.writeFile).called;
    });

    it('should log error and continue when fetching mutators', async () => {
      stubTestRunners('stryker-awesome-runner');
      restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/mutator-plugin').rejects();
      stubReporters();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-webpack': null });

      await sut.initialize();

      expect(testInjector.logger.error).calledWith(
        'Unable to reach npms.io (for query /v2/search?q=keywords:@stryker-mutator/mutator-plugin). Please check your internet connection.'
      );
      expect(out).calledWith('Unable to select a mutator. You will need to configure it manually.');
      expect(fs.promises.writeFile).called;
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
    restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/test-runner-plugin').resolves({
      result: {
        results: testRunners.map((testRunner) => ({ package: { name: testRunner, version: '1.1.1' } })),
      },
      statusCode: 200,
    });
  };

  const stubMutators = (...mutators: string[]) => {
    restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/mutator-plugin').resolves({
      result: {
        results: mutators.map((mutator) => ({ package: { name: mutator, version: '1.1.1' } })),
      },
      statusCode: 200,
    });
  };

  const stubReporters = (...reporters: string[]) => {
    restClientSearch.get.withArgs('/v2/search?q=keywords:@stryker-mutator/reporter-plugin').resolves({
      result: {
        results: reporters.map((reporter) => ({ package: { name: reporter, version: '1.1.1' } })),
      },
      statusCode: 200,
    });
  };
  const stubPackageClient = (packageConfigPerPackage: { [packageName: string]: Record<string, unknown> | null }) => {
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
      restClientPackage.get.withArgs(`/${packageName}@1.1.1/package.json`).resolves({
        result: pkgConfig,
        statusCode: 200,
      });
    });
  };

  interface StrykerInitAnswers {
    preset: string | null;
    testRunner: string;
    mutator: string;
    reporters: string[];
    packageManager: string;
  }

  function arrangeAnswers(answerOverrides?: Partial<StrykerInitAnswers>) {
    const answers: StrykerInitAnswers = Object.assign(
      {
        mutator: 'typescript',
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
      handbookUrl: '',
    };
    presetMock.createConfig.resolves(Object.assign({}, presetConfig, presetConfigOverrides));
  }

  function expectStrykerConfWritten(expectedRawConfig: string) {
    expect(fsWriteFile).calledWithMatch(
      sinon.match('stryker.conf.js'),
      sinon.match((actualConf: string) => normalizeWhitespaces(expectedRawConfig) === normalizeWhitespaces(actualConf))
    );
    fsWriteFile.getCall(0);
  }
});
