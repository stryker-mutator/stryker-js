import childProcess from 'child_process';
import fs from 'fs';
import { syncBuiltinESMExports } from 'module';

import { testInjector } from '@stryker-mutator/test-helpers';
import { childProcessAsPromised, normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';
import inquirer from 'inquirer';
import sinon from 'sinon';
import typedRestClient, { type RestClient } from 'typed-rest-client/RestClient.js';

import { fileUtils } from '../../../src/utils/file-utils.js';
import { initializerTokens } from '../../../src/initializer/index.js';
import { NpmClient, NpmSearchResult } from '../../../src/initializer/npm-client.js';
import { StrykerConfigWriter } from '../../../src/initializer/stryker-config-writer.js';
import { StrykerInitializer } from '../../../src/initializer/stryker-initializer.js';
import { StrykerInquirer } from '../../../src/initializer/stryker-inquirer.js';
import { Mock } from '../../helpers/producers.js';
import { GitignoreWriter } from '../../../src/initializer/gitignore-writer.js';
import { SUPPORTED_CONFIG_FILE_NAMES } from '../../../src/config/config-file-formats.js';
import { CustomInitializer, CustomInitializerConfiguration } from '../../../src/initializer/custom-initializers/custom-initializer.js';
import { PackageInfo } from '../../../src/initializer/package-info.js';
import { ListChoices, InputQuestion, ListQuestion, Question, CheckboxChoices } from '../../../src/initializer/types.js';

describe(StrykerInitializer.name, () => {
  let sut: StrykerInitializer;
  let inquirerPrompt: sinon.SinonStubbedMember<typeof inquirer.prompt>;
  let childExecSync: sinon.SinonStub;
  let childExec: sinon.SinonStub;
  let fsWriteFile: sinon.SinonStubbedMember<typeof fs.promises.writeFile>;
  let existsStub: sinon.SinonStubbedMember<(typeof fileUtils)['exists']>;
  let npmRestClient: sinon.SinonStubbedInstance<RestClient>;
  let gitignoreWriter: sinon.SinonStubbedInstance<GitignoreWriter>;
  let out: sinon.SinonStub;
  let customInitializers: CustomInitializer[];
  let customInitializerMock: Mock<CustomInitializer>;

  beforeEach(() => {
    out = sinon.stub();
    customInitializers = [];
    customInitializerMock = {
      createConfig: sinon.stub(),
      name: 'awesome-preset',
    };
    childExec = sinon.stub(childProcessAsPromised, 'exec');
    inquirerPrompt = sinon.stub(inquirer, 'prompt');
    childExecSync = sinon.stub(childProcess, 'execSync');
    fsWriteFile = sinon.stub(fs.promises, 'writeFile');
    existsStub = sinon.stub(fileUtils, 'exists');
    npmRestClient = sinon.createStubInstance(typedRestClient.RestClient);
    gitignoreWriter = sinon.createStubInstance(GitignoreWriter);
    syncBuiltinESMExports();
    sut = testInjector.injector
      .provideValue(initializerTokens.out, out as unknown as typeof console.log)
      .provideValue(initializerTokens.restClientNpm, npmRestClient)
      .provideClass(initializerTokens.inquirer, StrykerInquirer)
      .provideClass(initializerTokens.npmClient, NpmClient)
      .provideValue(initializerTokens.customInitializers, customInitializers)
      .provideClass(initializerTokens.configWriter, StrykerConfigWriter)
      .provideValue(initializerTokens.gitignoreWriter, gitignoreWriter)
      .injectClass(StrykerInitializer);
  });

  describe('initialize()', () => {
    beforeEach(() => {
      stubTestRunners('@stryker-mutator/awesome-runner', 'stryker-hyper-runner', 'stryker-ghost-runner', '@stryker-mutator/jest-runner');
      stubReporters('stryker-dimension-reporter', '@stryker-mutator/mars-reporter');
      stubPackageClient({
        '@stryker-mutator/awesome-runner': undefined,
        '@stryker-mutator/javascript-mutator': undefined,
        '@stryker-mutator/mars-reporter': undefined,
        '@stryker-mutator/typescript': undefined,
        '@stryker-mutator/webpack': undefined,
        'stryker-dimension-reporter': undefined,
        'stryker-ghost-runner': undefined,
        'stryker-hyper-runner': {
          files: [],
          someOtherSetting: 'enabled',
        },
        '@stryker-mutator/jest-runner': undefined,
      });
      fsWriteFile.resolves();
      customInitializers.push(customInitializerMock);
    });

    it('should prompt for preset, test runner, reporters, package manager and config type', async () => {
      arrangeAnswers({
        packageManager: 'yarn',
        reporters: ['dimension', 'mars'],
        testRunner: 'awesome',
      });

      await sut.initialize();

      expect(inquirerPrompt).callCount(6);
      const [promptPreset, promptTestRunner, promptBuildCommand, promptReporters, promptPackageManagers, promptConfigTypes] = [
        inquirerPrompt.getCall(0).args[0],
        inquirerPrompt.getCall(1).args[0],
        inquirerPrompt.getCall(2).args[0],
        inquirerPrompt.getCall(3).args[0],
        inquirerPrompt.getCall(4).args[0],
        inquirerPrompt.getCall(5).args[0],
      ] as Question[];

      expect(promptPreset.type).to.eq('select');
      expect(promptPreset.name).to.eq('preset');
      const expectedPresetChoices: ListChoices = [{ value: 'awesome-preset' }, new inquirer.Separator(), { value: 'None/other' }];
      expect((promptPreset as ListQuestion).choices).to.deep.eq(expectedPresetChoices);
      expect(promptTestRunner.type).to.eq('select');
      expect(promptTestRunner.name).to.eq('testRunner');
      const expectedTestRunnerChoices: ListChoices = [
        { value: 'awesome' },
        { value: 'hyper' },
        { value: 'ghost' },
        { value: 'jest' },
        new inquirer.Separator(),
        { value: 'command' },
      ];
      expect((promptTestRunner as ListQuestion).choices).to.deep.eq(expectedTestRunnerChoices);
      expect(promptBuildCommand.name).to.eq('buildCommand');
      expect(promptReporters.type).to.eq('checkbox');
      const expectedReporterChoices: CheckboxChoices = [
        { value: 'dimension', checked: false },
        { value: 'mars', checked: false },
        { value: 'html', checked: true },
        { value: 'clear-text', checked: true },
        { value: 'progress', checked: true },
        { value: 'dashboard', checked: false },
      ];
      expect((promptReporters as ListQuestion).choices).to.deep.eq(expectedReporterChoices);
      expect(promptPackageManagers.type).to.eq('select');
      const expectedPackageManagerChoices: ListChoices = [{ value: 'npm' }, { value: 'yarn' }, { value: 'pnpm' }];
      expect((promptPackageManagers as ListQuestion).choices).to.deep.eq(expectedPackageManagerChoices);
      expect(promptConfigTypes.type).to.eq('select');
      const expectedConfigFormatChoices: ListChoices = [{ value: 'JSON' }, { value: 'JavaScript' }];
      expect((promptConfigTypes as ListQuestion).choices).to.deep.eq(expectedConfigFormatChoices);
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
      expect(out).calledWith(
        'Done configuring stryker. Please review "stryker.config.json", you might need to configure your test runner correctly.',
      );
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
      const expectedOutput = `// @ts-check
        /** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */  
        const config =  {
          "_comment": "This config was generated using 'stryker init'. Please see the guide for more information: https://awesome-preset.org",
          "awesomeConf": "${config.awesomeConf}"
        };
        export default config;`;
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset',
        configType: 'JavaScript',
      });
      await sut.initialize();
      expectStrykerConfWritten(expectedOutput);
      expect(childExec).calledWith('npx prettier --write stryker.config.mjs');
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
      expect(out).calledWith('Unable to format stryker.config.mjs file for you. This is not a big problem, but it might look a bit messy 🙈.');
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
      const [promptPreset, promptConfigType, promptPackageManager] = [
        inquirerPrompt.getCall(0).args[0],
        inquirerPrompt.getCall(1).args[0],
        inquirerPrompt.getCall(2).args[0],
      ] as Question[];
      expect(promptPreset.type).to.eq('select');
      expect(promptPreset.name).to.eq('preset');
      const expectedPresetChoices: ListChoices = [{ value: 'awesome-preset' }, new inquirer.Separator(), { value: 'None/other' }];
      expect((promptPreset as ListQuestion).choices).to.deep.eq(expectedPresetChoices);
      expect(promptConfigType.type).to.eq('select');
      const expectedConfigChoices: ListChoices = [{ value: 'JSON' }, { value: 'JavaScript' }];
      expect((promptConfigType as ListQuestion).choices).to.deep.eq(expectedConfigChoices);
      expect(promptPackageManager.type).to.eq('select');
      const expectedPackageManagerChoices: ListChoices = [{ value: 'npm' }, { value: 'yarn' }, { value: 'pnpm' }];
      expect((promptPackageManager as ListQuestion).choices).to.deep.eq(expectedPackageManagerChoices);
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

    it('should install additional dependencies with pnpm', async () => {
      inquirerPrompt.resolves({
        packageManager: 'pnpm',
        reporters: [],
        testRunner: 'awesome',
      });
      await sut.initialize();
      expect(childExecSync).calledWith('pnpm add -D @stryker-mutator/awesome-runner', {
        stdio: [0, 1, 2],
      });
    });

    it('should explicitly specify plugins when using pnpm', async () => {
      childExec.resolves();
      const expectedOutput = `// @ts-check
          /** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */  
          const config =  {
            "_comment": "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
            "packageManager": "pnpm",
            "reporters": [],
            "testRunner": "awesome",
            "testRunner_comment": "Take a look at (missing 'homepage' URL in package.json) for information about the awesome plugin.",
            "coverageAnalysis": "perTest",
            "plugins": [ "@stryker-mutator/awesome-runner" ]
          };
          export default config;`;
      inquirerPrompt.resolves({
        packageManager: 'pnpm',
        reporters: [],
        testRunner: 'awesome',
        configType: 'JavaScript',
      });
      await sut.initialize();
      expectStrykerConfWritten(expectedOutput);
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
      expect(fileName).eq('stryker.config.json');
      const normalizedContent = normalizeWhitespaces(content as string);
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
      expect(fs.promises.writeFile).calledWith('stryker.config.json', sinon.match('"someOtherSetting": "enabled"'));
      expect(fs.promises.writeFile).calledWith('stryker.config.json', sinon.match('"files": []'));
    });

    it('should annotate the config file with the docs url', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'hyper',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(fs.promises.writeFile).calledWith(
        'stryker.config.json',
        sinon.match(
          '"_comment": "This config was generated using \'stryker init\'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information."',
        ),
      );
    });

    it('should not prompt for buildCommand if test runner is jest', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['dimension', 'mars', 'progress'],
        testRunner: 'jest',
        configType: 'JSON',
        buildCommand: 'none',
      });

      await sut.initialize();

      const promptBuildCommand = inquirerPrompt.getCalls().filter((call) => (call.args[0] as Question).name === 'buildCommand');
      expect(promptBuildCommand.length === 1);
      const buildQuestion = promptBuildCommand[0].args[0] as InputQuestion;
      expect(buildQuestion.when).to.be.false;
      expect(fs.promises.writeFile).calledWith(
        'stryker.config.json',
        sinon.match((val) => !val.includes('"buildCommand": ')),
      );
    });

    it('should not write "buildCommand" config option if empty buildCommand entered', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'hyper',
        configType: 'JSON',
        buildCommand: 'none',
      });
      await sut.initialize();
      expect(fs.promises.writeFile).calledWith(
        'stryker.config.json',
        sinon.match((val) => !val.includes('"buildCommand": ')),
      );
    });

    it('should save entered build command', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'hyper',
        configType: 'JSON',
        buildCommand: 'npm run build',
      });
      await sut.initialize();
      expect(fs.promises.writeFile).calledWith('stryker.config.json', sinon.match('"buildCommand": "npm run build"'));
    });

    it('should set "coverageAnalysis" to "off" when the command test runner is chosen', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'command',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(fs.promises.writeFile).calledWith('stryker.config.json', sinon.match('"coverageAnalysis": "off"'));
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

    it('should write not found if test runner homepage url as comment when not found', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'hyper',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(fs.promises.writeFile).calledWith(
        'stryker.config.json',
        sinon.match('"testRunner_comment": "Take a look at (missing \'homepage\' URL in package.json) for information about the hyper plugin."'),
      );
    });

    it('should write URL if test runner homepage url as comment', async () => {
      stubPackageClient({ 'stryker-hyper-runner': { name: 'hyper' } }, 'https://url-to-hyper.com');
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'hyper',
        configType: 'JSON',
      });
      await sut.initialize();
      expect(fs.promises.writeFile).calledWith(
        'stryker.config.json',
        sinon.match('"testRunner_comment": "Take a look at https://url-to-hyper.com for information about the hyper plugin."'),
      );
    });
  });

  describe('initialize() when no internet', () => {
    it('should log error and continue when fetching test runners', async () => {
      npmRestClient.get.withArgs('/-/v1/search?text=keywords:%40stryker-mutator%2Ftest-runner-plugin').rejects();
      stubReporters();
      stubPackageClient({ 'stryker-javascript': undefined, 'stryker-webpack': undefined });
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        configType: 'JSON',
      });

      await sut.initialize();

      expect(testInjector.logger.error).calledWith(
        "Unable to reach 'https://registry.npmjs.com' (for query /-/v1/search?text=keywords:%40stryker-mutator%2Ftest-runner-plugin). Please check your internet connection.",
      );
      expect(fs.promises.writeFile).calledWith('stryker.config.json', sinon.match('"testRunner": "command"'));
    });

    it('should log error and continue when fetching stryker reporters', async () => {
      stubTestRunners('stryker-awesome-runner');
      npmRestClient.get.withArgs('/-/v1/search?text=keywords:%40stryker-mutator%2Freporter-plugin').rejects();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      stubPackageClient({ 'stryker-awesome-runner': undefined, 'stryker-javascript': undefined, 'stryker-webpack': undefined });

      await sut.initialize();

      expect(testInjector.logger.error).calledWith(
        "Unable to reach 'https://registry.npmjs.com' (for query /-/v1/search?text=keywords:%40stryker-mutator%2Freporter-plugin). Please check your internet connection.",
      );
      expect(fs.promises.writeFile).called;
    });

    it('should log warning and continue when fetching custom config', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubReporters();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        configType: 'JSON',
      });
      npmRestClient.get.rejects();

      await sut.initialize();

      expect(testInjector.logger.warn).calledWith(
        'Could not fetch additional initialization config for dependency stryker-awesome-runner. You might need to configure it manually',
      );
      expect(fs.promises.writeFile).called;
    });
  });

  SUPPORTED_CONFIG_FILE_NAMES.forEach((fileName) => {
    it(`should log an error and quit when \`${fileName}\` file already exists`, async () => {
      existsStub.withArgs(fileName).resolves(true);

      await expect(sut.initialize()).to.be.rejected;
      expect(testInjector.logger.error).calledWith(
        `Stryker config file "${fileName}" already exists in the current directory. Please remove it and try again.`,
      );
    });
  });

  const stubTestRunners = (...testRunners: string[]) => {
    const testRunnersResult: NpmSearchResult = {
      total: testRunners.length,
      objects: testRunners.map((testRunner) => ({
        package: { name: testRunner, version: '1.1.1', keywords: ['@stryker-mutator/test-runner-plugin'] },
      })),
    };

    npmRestClient.get.withArgs('/-/v1/search?text=keywords:%40stryker-mutator%2Ftest-runner-plugin').resolves({
      result: testRunnersResult,
      statusCode: 200,
      headers: {},
    });
  };

  const stubReporters = (...reporters: string[]) => {
    const reportersResult: NpmSearchResult = {
      total: reporters.length,
      objects: reporters.map((reporter) => ({ package: { name: reporter, version: '1.1.1', keywords: ['@stryker-mutator/reporter-plugin'] } })),
    };
    npmRestClient.get
      .withArgs('/-/v1/search?text=keywords:%40stryker-mutator%2Freporter-plugin')
      .resolves({ statusCode: 200, headers: {}, result: reportersResult });
  };
  const stubPackageClient = (initStrykerConfigPerPackage: Record<string, Record<string, unknown> | undefined>, homepage?: string) => {
    Object.keys(initStrykerConfigPerPackage).forEach((name) => {
      const initStrykerConfig = initStrykerConfigPerPackage[name];
      const result: PackageInfo = {
        name,
        homepage,
        initStrykerConfig,
        keywords: [],
        version: '1.1.1',
      };
      npmRestClient.get.withArgs(`/${encodeURIComponent(name)}/1.1.1`).resolves({
        result,
        statusCode: 200,
        headers: {},
      });
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
      answerOverrides,
    );
    inquirerPrompt.resolves(answers);
  }

  function resolvePresetConfig(overrides?: Partial<CustomInitializerConfiguration>) {
    customInitializerMock.createConfig.resolves({ config: {}, dependencies: [], guideUrl: '', ...overrides });
  }

  function expectStrykerConfWritten(expectedRawConfig: string) {
    const [fileName, actualConfig] = fsWriteFile.getCall(0).args;
    expect(fileName).eq('stryker.config.mjs');
    expect(normalizeWhitespaces(actualConfig as string)).eq(normalizeWhitespaces(expectedRawConfig));
  }
});
