import * as child from 'child_process';
import * as sinon from 'sinon';
import { Logger } from 'stryker-api/logging';
import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as inquirer from 'inquirer';
import StrykerInitializer from '../../../src/initializer/StrykerInitializer';
import * as restClient from 'typed-rest-client/RestClient';
import currentLogMock from '../../helpers/logMock';
import { Mock } from '../../helpers/producers';
import NpmClient from '../../../src/initializer/NpmClient';
import { format } from 'prettier';
import PresetConfiguration from '../../../src/initializer/presets/PresetConfiguration';
import Preset from '../../../src/initializer/presets/Preset';

describe('StrykerInitializer', () => {
  let log: Mock<Logger>;
  let sut: StrykerInitializer;
  let inquirerPrompt: sinon.SinonStub;
  let childExecSync: sinon.SinonStub;
  let fsWriteFile: sinon.SinonStub;
  let fsExistsSync: sinon.SinonStub;
  let restClientPackageGet: sinon.SinonStub;
  let restClientSearchGet: sinon.SinonStub;
  let out: sinon.SinonStub;
  let presets: Preset[];
  let presetMock: Mock<Preset>;

  beforeEach(() => {
    log = currentLogMock();
    out = sandbox.stub();
    presets = [];
    presetMock = {
      createConfig: sandbox.stub(),
      name: 'awesome-preset'
    };
    inquirerPrompt = sandbox.stub(inquirer, 'prompt');
    childExecSync = sandbox.stub(child, 'execSync');
    fsWriteFile = sandbox.stub(fsAsPromised, 'writeFile');
    fsExistsSync = sandbox.stub(fsAsPromised, 'existsSync');
    restClientSearchGet = sandbox.stub();
    restClientPackageGet = sandbox.stub();
    sandbox.stub(restClient, 'RestClient')
      .withArgs('npmSearch').returns({
        get: restClientSearchGet
      })
      .withArgs('npm').returns({
        get: restClientPackageGet
      });
    sut = new StrykerInitializer(out, new NpmClient(), presets);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialize()', () => {

    beforeEach(() => {
      stubTestRunners('stryker-awesome-runner', 'stryker-hyper-runner', 'stryker-ghost-runner');
      stubTestFrameworks({ name: 'stryker-awesome-framework', keywords: ['stryker-awesome-runner'] }, { name: 'stryker-hyper-framework', keywords: ['stryker-hyper-runner'] });
      stubMutators('stryker-typescript', 'stryker-javascript');
      stubTranspilers('stryker-typescript', 'stryker-webpack');
      stubReporters('stryker-dimension-reporter', 'stryker-mars-reporter');
      stubPackageClient({
        'stryker-awesome-framework': null,
        'stryker-awesome-runner': null,
        'stryker-dimension-reporter': null,
        'stryker-ghost-runner': null,
        'stryker-hyper-framework': null,
        'stryker-hyper-runner': {
          files: [],
          someOtherSetting: 'enabled'
        },
        'stryker-javascript': null,
        'stryker-mars-reporter': null,
        'stryker-typescript': null,
        'stryker-webpack': null
      });
      fsWriteFile.resolves({});
      presets.push(presetMock);
    });

    it('should prompt for preset, test runner, test framework, mutator, transpilers, reporters, and package manager', async () => {
      arrangeAnswers({
        mutator: 'typescript',
        packageManager: 'yarn',
        reporters: ['dimension', 'mars'],
        testFramework: 'awesome',
        testRunner: 'awesome',
        transpilers: ['webpack']
      });
      await sut.initialize();
      expect(inquirerPrompt).to.have.been.callCount(7);
      const [promptPreset, promptTestRunner, promptTestFramework, promptMutator, promptTranspilers, promptReporters, promptPackageManagers]: inquirer.Question[] = [
        inquirerPrompt.getCall(0).args[0],
        inquirerPrompt.getCall(1).args[0],
        inquirerPrompt.getCall(2).args[0],
        inquirerPrompt.getCall(3).args[0],
        inquirerPrompt.getCall(4).args[0],
        inquirerPrompt.getCall(5).args[0],
        inquirerPrompt.getCall(6).args[0],
      ];
      expect(promptPreset.type).to.eq('list');
      expect(promptPreset.name).to.eq('preset');
      expect(promptPreset.choices).to.deep.eq(['awesome-preset', new inquirer.Separator(), 'None/other']);
      expect(promptTestRunner.type).to.eq('list');
      expect(promptTestRunner.name).to.eq('testRunner');
      expect(promptTestRunner.choices).to.deep.eq(['awesome', 'hyper', 'ghost', new inquirer.Separator(), 'command']);
      expect(promptTestFramework.type).to.eq('list');
      expect(promptTestFramework.choices).to.deep.eq(['awesome', 'None/other']);
      expect(promptMutator.type).to.eq('list');
      expect(promptMutator.choices).to.deep.eq(['typescript', 'javascript']);
      expect(promptTranspilers.type).to.eq('checkbox');
      expect(promptTranspilers.choices).to.deep.eq(['typescript', 'webpack']);
      expect(promptReporters.type).to.eq('checkbox');
      expect(promptReporters.choices).to.deep.eq(['dimension', 'mars', 'clear-text', 'progress', 'dashboard']);
      expect(promptPackageManagers.type).to.eq('list');
      expect(promptPackageManagers.choices).to.deep.eq(['npm', 'yarn']);
    });

    it('should immediately complete when a preset and package manager is chosen', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset'
      });
      resolvePresetConfig();
      await sut.initialize();
      expect(inquirerPrompt).to.have.been.callCount(2);
      expect(out).to.have.been.calledWith('Done configuring stryker. Please review `stryker.conf.js`, you might need to configure transpilers or your test runner correctly.');
      expect(out).to.have.been.calledWith('Let\'s kill some mutants with this command: `stryker run`');
    });

    it('should correctly load the stryker configuration file', async () => {
      const config = `{
        'awesome-conf': 'awesome',
      }`;
      const handbookUrl = 'https://awesome-preset.org';
      resolvePresetConfig({
        config,
        handbookUrl
      });
      const expectedOutput = format(`
        // This config was generated using a preset.
        // Please see the handbook for more information: ${handbookUrl}
        module.exports = function(config){
          config.set(
            ${config}
          );
        }`, { parser: 'babylon' });
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset'
      });
      await sut.initialize();
      expect(fsWriteFile).to.have.been.calledWith('stryker.conf.js', expectedOutput);
    });

    it('should correctly load dependencies from the preset', async () => {
      resolvePresetConfig({ dependencies: ['my-awesome-dependency', 'another-awesome-dependency'] });
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset'
      });
      await sut.initialize();
      expect(fsWriteFile).to.have.been.calledOnce;
      expect(childExecSync).to.have.been.calledWith('npm i --save-dev stryker-api my-awesome-dependency another-awesome-dependency', { stdio: [0, 1, 2] });
    });

    it('should correctly load configuration from a preset', async () => {
      resolvePresetConfig();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        preset: 'awesome-preset'
      });
      await sut.initialize();
      expect(inquirerPrompt).to.have.been.callCount(2);
      const [promptPreset, promptPackageManager]: inquirer.Question[] = [
        inquirerPrompt.getCall(0).args[0],
        inquirerPrompt.getCall(1).args[0]
      ];
      expect(promptPreset.type).to.eq('list');
      expect(promptPreset.name).to.eq('preset');
      expect(promptPreset.choices).to.deep.eq(['awesome-preset', new inquirer.Separator(), 'None/other']);
      expect(promptPackageManager.type).to.eq('list');
      expect(promptPackageManager.choices).to.deep.eq(['npm', 'yarn']);
    });

    it('should not prompt for testFramework if test runner is "command"', async () => {
      arrangeAnswers({ testRunner: 'command' });
      await sut.initialize();
      expect(inquirer.prompt).not.calledWithMatch(sinon.match({ name: 'testFramework' }));
    });

    it('should configure coverageAnalysis: "all" when the user did not select a testFramework', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['dimension', 'mars'],
        testFramework: 'None/other',
        testRunner: 'awesome',
        transpilers: ['webpack']
      });
      await sut.initialize();
      expect(inquirerPrompt).to.have.been.callCount(7);
      expect(out).to.have.been.calledWith('OK, downgrading coverageAnalysis to "all"');
      expect(fsAsPromised.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('coverageAnalysis: "all"'));
    });

    it('should install any additional dependencies', async () => {
      inquirerPrompt.resolves({
        mutator: 'typescript',
        packageManager: 'npm',
        reporters: ['dimension', 'mars'],
        testFramework: 'awesome',
        testRunner: 'awesome',
        transpilers: ['webpack']
      });
      await sut.initialize();
      expect(out).to.have.been.calledWith('Installing NPM dependencies...');
      expect(childExecSync).to.have.been.calledWith('npm i --save-dev stryker-api stryker-awesome-runner stryker-awesome-framework stryker-typescript stryker-webpack stryker-dimension-reporter stryker-mars-reporter',
        { stdio: [0, 1, 2] });
    });

    it('should configure testFramework, testRunner, mutator, transpilers, reporters, and packageManager', async () => {
      inquirerPrompt.resolves({
        mutator: 'typescript',
        packageManager: 'npm',
        reporters: ['dimension', 'mars', 'progress'],
        testFramework: 'awesome',
        testRunner: 'awesome',
        transpilers: ['webpack']
      });
      await sut.initialize();
      expect(fsAsPromised.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('testRunner: {')
        .and(sinon.match('name: "awesome"')) // testRunner name
        .and(sinon.match('testFramework: "awesome"'))
        .and(sinon.match('packageManager: "npm"'))
        .and(sinon.match('coverageAnalysis: "perTest"'))
        .and(sinon.match('mutator: "typescript"'))
        .and(sinon.match('transpilers: ["webpack"]'))
        .and(sinon.match(`"dimension", "mars", "progress"`)));
    });

    it('should configure the additional settings from the plugins', async () => {
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testFramework: 'hyper',
        testRunner: 'hyper',
        transpilers: ['webpack']
      });
      await sut.initialize();
      expect(fsAsPromised.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('someOtherSetting: "enabled"'));
      expect(fsAsPromised.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('files: []'));
    });

    describe('but no testFramework can be found that supports the testRunner', () => {

      beforeEach(() => inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['dimension', 'mars'],
        testRunner: 'ghost',
        transpilers: ['webpack']
      }));

      it('should not prompt for test framework', async () => {
        await sut.initialize();

        expect(inquirerPrompt).to.have.been.callCount(6);
        expect(inquirerPrompt).not.calledWithMatch(sinon.match({ name: 'testFramework' }));
      });

      it('should configure coverageAnalysis: "all"', async () => {
        await sut.initialize();

        expect(out).to.have.been.calledWith('No stryker test framework plugin found that is compatible with ghost, downgrading coverageAnalysis to "all"');
        expect(fsAsPromised.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('coverageAnalysis: "all"'));
      });
    });

    it('should reject with that error', () => {
      const expectedError = new Error('something');
      fsWriteFile.rejects(expectedError);
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'ghost',
        transpilers: ['webpack']
      });

      return expect(sut.initialize()).to.eventually.be.rejectedWith(expectedError);
    });

    it('should recover when install fails', async () => {
      childExecSync.throws('error');
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: [],
        testRunner: 'ghost',
        transpilers: ['webpack']
      });
      stubTranspilers('webpack');
      stubPackageClient({ 'stryker-webpack': null });

      await sut.initialize();

      expect(out).to.have.been.calledWith('An error occurred during installation, please try it yourself: "npm i --save-dev stryker-api stryker-ghost-runner"');
      expect(fsAsPromised.writeFile).to.have.been.called;
    });
  });

  describe('initialize() when no internet', () => {

    it('should log error and continue when fetching test runners', async () => {
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-test-runner').rejects();
      stubMutators('stryker-javascript');
      stubTranspilers('stryker-webpack');
      stubReporters();
      stubPackageClient({ 'stryker-javascript': null, 'stryker-webpack': null });
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        transpilers: ['webpack']
      });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-test-runner). Please check your internet connection.');
      expect(out).to.have.been.calledWith('Unable to select a test runner. You will need to configure it manually.');
      expect(fsAsPromised.writeFile).to.have.been.called;
    });

    it('should log error and continue when fetching test frameworks', async () => {
      stubTestRunners('stryker-awesome-runner');
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-test-framework').rejects();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        transpilers: ['webpack']
      });
      stubMutators('stryker-javascript');
      stubTranspilers('stryker-webpack');
      stubReporters();
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-javascript': null, 'stryker-webpack': null });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-test-framework). Please check your internet connection.');
      expect(out).to.have.been.calledWith('No stryker test framework plugin found that is compatible with awesome, downgrading coverageAnalysis to "all"');
      expect(fsAsPromised.writeFile).to.have.been.called;
    });

    it('should log error and continue when fetching mutators', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubTestFrameworks({ name: 'stryker-awesome-framework', keywords: ['stryker-awesome-runner'] });
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-mutator').rejects();
      stubTranspilers('stryker-webpack');
      stubReporters();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        transpilers: ['webpack']
      });
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-webpack': null });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-mutator). Please check your internet connection.');
      expect(out).to.have.been.calledWith('Unable to select a mutator. You will need to configure it manually.');
      expect(fsAsPromised.writeFile).to.have.been.called;
    });

    it('should log error and continue when fetching transpilers', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubTestFrameworks({ name: 'stryker-awesome-framework', keywords: ['stryker-awesome-runner'] });
      stubMutators('stryker-javascript');
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-transpiler').rejects();
      stubReporters();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome'
      });
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-javascript': null });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-transpiler). Please check your internet connection.');
      expect(out).to.have.been.calledWith('Unable to select transpilers. You will need to configure it manually, if you want to use any.');
      expect(fsAsPromised.writeFile).to.have.been.called;
    });

    it('should log error and continue when fetching stryker reporters', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubTestFrameworks({ name: 'stryker-awesome-framework', keywords: ['stryker-awesome-runner'] });
      stubMutators('stryker-javascript');
      stubTranspilers('stryker-webpack');
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-reporter').rejects();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        transpilers: ['webpack']
      });
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-javascript': null, 'stryker-webpack': null });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-reporter). Please check your internet connection.');
      expect(fsAsPromised.writeFile).to.have.been.called;
    });

    it('should log warning and continue when fetching custom config', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubTestFrameworks();
      stubMutators();
      stubTranspilers('webpack');
      stubReporters();
      inquirerPrompt.resolves({
        packageManager: 'npm',
        reporters: ['clear-text'],
        testRunner: 'awesome',
        transpilers: ['webpack']
      });
      restClientPackageGet.rejects();

      await sut.initialize();

      expect(log.warn).to.have.been.calledWith('Could not fetch additional initialization config for dependency stryker-awesome-runner. You might need to configure it manually');
      expect(fsAsPromised.writeFile).to.have.been.called;
    });

  });

  it('should log an error and quit when `stryker.conf.js` file already exists', async () => {
    fsExistsSync.resolves(true);

    expect(sut.initialize()).to.be.rejected;
    expect(log.error).to.have.been.calledWith('Stryker config file "stryker.conf.js" already exists in the current directory. Please remove it and try again.');
  });

  const stubTestRunners = (...testRunners: string[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-test-runner').resolves({
      result: {
        results: testRunners.map(testRunner => ({ package: { name: testRunner } }))
      },
      statusCode: 200
    });
  };

  const stubTestFrameworks = (...testFrameworks: { name: string; keywords: string[]; }[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-test-framework').resolves({
      result: {
        results: testFrameworks.map(testFramework => ({ package: testFramework }))
      },
      statusCode: 200
    });
  };

  const stubMutators = (...mutators: string[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-mutator').resolves({
      result: {
        results: mutators.map(mutator => ({ package: { name: mutator } }))
      },
      statusCode: 200
    });
  };

  const stubTranspilers = (...transpilers: string[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-transpiler').resolves({
      result: {
        results: transpilers.map(transpiler => ({ package: { name: transpiler } }))
      },
      statusCode: 200
    });
  };

  const stubReporters = (...reporters: string[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-reporter').resolves({
      result: {
        results: reporters.map(reporter => ({ package: { name: reporter } }))
      },
      statusCode: 200
    });
  };
  const stubPackageClient = (packageConfigPerPackage: { [packageName: string]: object | null; }) => {
    Object.keys(packageConfigPerPackage).forEach(packageName => {
      const pkgConfig: { name: string; initStrykerConfig?: object; } = {
        name: packageName
      };
      const cfg = packageConfigPerPackage[packageName];
      if (cfg) {
        pkgConfig.initStrykerConfig = cfg;
      }
      restClientPackageGet.withArgs(`/${packageName}/latest`).resolves({
        result: pkgConfig,
        statusCode: 200
      });
    });
  };

  interface StrykerInitAnswers {
    preset: string | null;
    testFramework: string;
    testRunner: string;
    mutator: string;
    transpilers: string[];
    reporters: string[];
    packageManager: string;
  }

  function arrangeAnswers(answerOverrides?: Partial<StrykerInitAnswers>) {
    const answers: StrykerInitAnswers = Object.assign({
      mutator: 'typescript',
      packageManager: 'yarn',
      preset: null,
      reporters: ['dimension', 'mars'],
      testFramework: 'awesome',
      testRunner: 'awesome',
      transpilers: ['webpack']
    }, answerOverrides);
    inquirerPrompt.resolves(answers);
  }

  function resolvePresetConfig(presetConfigOverrides?: Partial<PresetConfiguration>) {
    const presetConfig: PresetConfiguration = {
      config: '',
      dependencies: [],
      handbookUrl: ''
    };
    presetMock.createConfig.resolves(Object.assign({}, presetConfig, presetConfigOverrides));
  }
});
