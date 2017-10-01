import * as child from 'child_process';
import * as fs from 'mz/fs';
import * as sinon from 'sinon';
import { expect } from 'chai';
import * as inquirer from 'inquirer';
import StrykerInitializer from '../../../src/initializer/StrykerInitializer';
import * as restClient from 'typed-rest-client/RestClient';
import log from '../../helpers/log4jsMock';

describe('StrykerInitializer', () => {
  let sut: StrykerInitializer;
  let sandbox: sinon.SinonSandbox;
  let inquirerPrompt: sinon.SinonStub;
  let childExecSync: sinon.SinonStub;
  let fsWriteFile: sinon.SinonStub;
  let fsExistsSync: sinon.SinonStub;
  let restClientPackageGet: sinon.SinonStub;
  let restClientSearchGet: sinon.SinonStub;
  let out: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    out = sandbox.stub();
    inquirerPrompt = sandbox.stub(inquirer, 'prompt');
    childExecSync = sandbox.stub(child, 'execSync');
    fsWriteFile = sandbox.stub(fs, 'writeFile');
    fsExistsSync = sandbox.stub(fs, 'existsSync');
    restClientSearchGet = sandbox.stub();
    restClientPackageGet = sandbox.stub();
    sandbox.stub(restClient, 'RestClient')
      .withArgs('npmSearch').returns({
        get: restClientSearchGet
      })
      .withArgs('npm').returns({
        get: restClientPackageGet
      });
    sut = new StrykerInitializer(out);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialize()', () => {

    beforeEach(() => {
      stubTestRunners('stryker-awesome-runner', 'stryker-hyper-runner', 'stryker-ghost-runner');
      stubTestFrameworks({ name: 'stryker-awesome-framework', keywords: ['stryker-awesome-runner'] }, { name: 'stryker-hyper-framework', keywords: ['stryker-hyper-runner'] });
      stubMutators('stryker-typescript', 'stryker-es5', 'stryker-es6');
      stubTranspilers('stryker-typescript', 'stryker-webpack');
      stubReporters('stryker-dimension-reporter', 'stryker-mars-reporter');
      stubPackageClient({
        'stryker-awesome-runner': null,
        'stryker-hyper-runner': {
          files: [],
          someOtherSetting: 'enabled'
        },
        'stryker-ghost-runner': null,
        'stryker-awesome-framework': null,
        'stryker-hyper-framework': null,
        'stryker-typescript' : null,
        'stryker-es5' : null,
        'stryker-es6' : null,
        'stryker-dimension-reporter': null,
        'stryker-mars-reporter': null,
        'stryker-webpack': null
      });
      fsWriteFile.resolves({});
    });

    it('should prompt for test runner, test framework, mutator, transpilers and reporters', async () => {
      inquirerPrompt.resolves({ testFramework: 'awesome', testRunner: 'awesome', mutator: 'typescript', transpilers: ['webpack'], reporters: ['dimension', 'mars'] });
      await sut.initialize();
      expect(inquirerPrompt).to.have.been.callCount(5);
      const [promptTestRunner, promptTestFramework, promptMutator, promptTranspilers, promptReporters]: inquirer.Question[] = [inquirerPrompt.getCall(0).args[0], inquirerPrompt.getCall(1).args[0], inquirerPrompt.getCall(2).args[0], inquirerPrompt.getCall(3).args[0], inquirerPrompt.getCall(4).args[0]];
      expect(promptTestRunner.type).to.eq('list');
      expect(promptTestRunner.name).to.eq('testRunner');
      expect(promptTestRunner.choices).to.deep.eq(['awesome', 'hyper', 'ghost']);
      expect(promptTestFramework.type).to.eq('list');
      expect(promptTestFramework.choices).to.deep.eq(['awesome', 'None/other']);
      expect(promptMutator.type).to.eq('list');
      expect(promptMutator.choices).to.deep.eq(['typescript', 'es5', 'es6']);
      expect(promptTranspilers.type).to.eq('checkbox');
      expect(promptTranspilers.choices).to.deep.eq(['typescript', 'webpack']);
      expect(promptReporters.type).to.eq('checkbox');
      expect(promptReporters.choices).to.deep.eq(['dimension', 'mars', 'clear-text', 'progress']);
    });

    it('should configure coverageAnalysis: "all" when the user did not select a testFramework', async () => {
      inquirerPrompt.resolves({ testFramework: 'None/other', testRunner: 'awesome', transpilers: ['webpack'], reporters: ['dimension', 'mars'] });
      await sut.initialize();
      expect(inquirerPrompt).to.have.been.callCount(5);
      expect(out).to.have.been.calledWith('OK, downgrading coverageAnalysis to "all"');
      expect(fs.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('coverageAnalysis: "all"'));
    });

    it('should install any additional dependencies', async () => {
      inquirerPrompt.resolves({ testFramework: 'awesome', testRunner: 'awesome', mutator: 'typescript', transpilers: ['webpack'], reporters: ['dimension', 'mars'] });
      await sut.initialize();
      expect(out).to.have.been.calledWith('Installing NPM dependencies...');
      expect(childExecSync).to.have.been.calledWith('npm i --save-dev stryker-api stryker-awesome-runner stryker-awesome-framework stryker-typescript stryker-webpack stryker-dimension-reporter stryker-mars-reporter',
        { stdio: [0, 1, 2] });
    });

    it('should configure testFramework, testRunner, mutator, transpilers and reporters', async () => {
      inquirerPrompt.resolves({ testFramework: 'awesome', testRunner: 'awesome', mutator: 'typescript', transpilers: ['webpack'], reporters: ['dimension', 'mars', 'progress'] });
      await sut.initialize();
      expect(fs.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('testRunner: "awesome"')
        .and(sinon.match('testFramework: "awesome"'))
        .and(sinon.match('coverageAnalysis: "perTest"'))
        .and(sinon.match('mutator: "typescript"'))
        .and(sinon.match('transpilers: ["webpack"]'))
        .and(sinon.match(`"dimension", "mars", "progress"`)));
    });

    it('should configure the additional settings from the plugins', async () => {
      inquirerPrompt.resolves({ testFramework: 'hyper', testRunner: 'hyper', transpilers: ['webpack'], reporters: [] });
      await sut.initialize();
      expect(fs.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('someOtherSetting: "enabled"'));
      expect(fs.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('files: []'));
    });

    describe('but no testFramework can be found that supports the testRunner', () => {

      beforeEach(() => inquirerPrompt.resolves({ testRunner: 'ghost', transpilers: ['webpack'], reporters: ['dimension', 'mars'] }));

      it('should not prompt for test framework', async () => {
        await sut.initialize();

        expect(inquirerPrompt).to.have.been.callCount(4);
        expect(inquirerPrompt).not.calledWithMatch(sinon.match({ name: 'testFramework' }));
      });

      it('should configure coverageAnalysis: "all"', async () => {
        await sut.initialize();

        expect(out).to.have.been.calledWith('No stryker test framework plugin found that is compatible with ghost, downgrading coverageAnalysis to "all"');
        expect(fs.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('coverageAnalysis: "all"'));
      });
    });

    it('should reject with that error', () => {
      const expectedError = new Error('something');
      fsWriteFile.rejects(expectedError);
      inquirerPrompt.resolves({ testRunner: 'ghost', transpilers: ['webpack'], reporters: [] });

      return expect(sut.initialize()).to.eventually.be.rejectedWith(expectedError);
    });

    it('should recover when install fails', async () => {
      childExecSync.throws('error');
      inquirerPrompt.resolves({ testRunner: 'ghost', transpilers: ['webpack'], reporters: [] });
      stubTranspilers('webpack');
      stubPackageClient({ 'stryker-webpack': null });

      await sut.initialize();

      expect(out).to.have.been.calledWith('An error occurred during installation, please try it yourself: "npm i --save-dev stryker-api stryker-ghost-runner"');
      expect(fs.writeFile).to.have.been.called;
    });
  });

  describe('initialize() when no internet', () => {

    it('should log error and continue when fetching test runners', async () => {
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-test-runner').rejects();
      stubMutators('stryker-es5');
      stubTranspilers('stryker-webpack');
      stubReporters();
      stubPackageClient({ 'stryker-es5': null, 'stryker-webpack': null });
      inquirerPrompt.resolves({ reporters: ['clear-text'], transpilers: ['webpack'] });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-test-runner). Please check your internet connection.');
      expect(out).to.have.been.calledWith('Unable to select a test runner. You will need to configure it manually.');
      expect(fs.writeFile).to.have.been.called;
    });

    it('should log error and continue when fetching test frameworks', async () => {
      stubTestRunners('stryker-awesome-runner');
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-test-framework').rejects();
      inquirerPrompt.resolves({ testRunner: 'awesome', reporters: ['clear-text'], transpilers: ['webpack'] });
      stubMutators('stryker-es5');
      stubTranspilers('stryker-webpack');
      stubReporters();
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-es5': null, 'stryker-webpack': null });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-test-framework). Please check your internet connection.');
      expect(out).to.have.been.calledWith('No stryker test framework plugin found that is compatible with awesome, downgrading coverageAnalysis to "all"');
      expect(fs.writeFile).to.have.been.called;
    });

    it('should log error and continue when fetching mutators', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubTestFrameworks({ name: 'stryker-awesome-framework', keywords: ['stryker-awesome-runner'] });
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-mutator').rejects();
      stubTranspilers('stryker-webpack');
      stubReporters();
      inquirerPrompt.resolves({ testRunner: 'awesome', reporters: ['clear-text'], transpilers: ['webpack'] });
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-webpack': null });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-mutator). Please check your internet connection.');
      expect(out).to.have.been.calledWith('Unable to select a mutator. You will need to configure it manually.');
      expect(fs.writeFile).to.have.been.called;
    });

    it('should log error and continue when fetching transpilers', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubTestFrameworks({ name: 'stryker-awesome-framework', keywords: ['stryker-awesome-runner'] });
      stubMutators('stryker-es5');
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-transpiler').rejects();
      stubReporters();
      inquirerPrompt.resolves({ testRunner: 'awesome', reporters: ['clear-text'] });
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-es5': null });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-transpiler). Please check your internet connection.');
      expect(out).to.have.been.calledWith('Unable to select transpilers. You will need to configure it manually, if you want to use any.');
      expect(fs.writeFile).to.have.been.called;
    });

    it('should log error and continue when fetching stryker reporters', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubTestFrameworks({ name: 'stryker-awesome-framework', keywords: ['stryker-awesome-runner'] });
      stubMutators('stryker-es5');
      stubTranspilers('stryker-webpack');
      restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-reporter').rejects();
      inquirerPrompt.resolves({ testRunner: 'awesome', reporters: ['clear-text'], transpilers: ['webpack'] });
      stubPackageClient({ 'stryker-awesome-runner': null, 'stryker-es5': null, 'stryker-webpack': null });

      await sut.initialize();

      expect(log.error).to.have.been.calledWith('Unable to reach https://api.npms.io (for query /v2/search?q=keywords:stryker-reporter). Please check your internet connection.');
      expect(fs.writeFile).to.have.been.called;
    });

    it('should log warning and continue when fetching custom config', async () => {
      stubTestRunners('stryker-awesome-runner');
      stubTestFrameworks();
      stubMutators('es5');
      stubTranspilers('webpack');
      stubReporters();
      inquirerPrompt.resolves({ testRunner: 'awesome', reporters: ['clear-text'], transpilers: ['webpack'] });
      restClientPackageGet.rejects();

      await sut.initialize();
      
      expect(log.warn).to.have.been.calledWith('Could not fetch additional initialization config for dependency stryker-awesome-runner. You might need to configure it manually');
      expect(fs.writeFile).to.have.been.called;
    });

  });

  it('should log an error and quit when `stryker.conf.js` file already exists', async () => {
    fsExistsSync.resolves(true);

    expect(sut.initialize()).to.be.rejected;
    expect(log.error).to.have.been.calledWith('Stryker config file "stryker.conf.js" already exists in the current directory. Please remove it and try again.');
  });

  const stubTestRunners = (...testRunners: string[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-test-runner').resolves({
      statusCode: 200,
      result: {
        results: testRunners.map(testRunner => ({ package: { name: testRunner } }))
      }
    });
  };

  const stubTestFrameworks = (...testFrameworks: { name: string; keywords: string[]; }[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-test-framework').resolves({
      statusCode: 200,
      result: {
        results: testFrameworks.map(testFramework => ({ package: testFramework }))
      }
    });
  };

  const stubMutators = (...mutators: string[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-mutator').resolves({
      statusCode: 200,
      result: {
        results: mutators.map(mutator => ({ package: { name: mutator } }))
      }
    });
  };

  const stubTranspilers = (...transpilers: string[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-transpiler').resolves({
      statusCode: 200,
      result: {
        results: transpilers.map(transpiler => ({ package: { name: transpiler } }))
      }
    });
  };

  const stubReporters = (...reporters: string[]) => {
    restClientSearchGet.withArgs('/v2/search?q=keywords:stryker-reporter').resolves({
      statusCode: 200,
      result: {
        results: reporters.map(reporter => ({ package: { name: reporter } }))
      }
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
        statusCode: 200,
        result: pkgConfig
      });
    });
  };
});
