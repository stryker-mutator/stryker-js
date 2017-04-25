import StrykerInitializer from '../../../src/initializer/StrykerInitializer';
import * as sinon from 'sinon';
import * as Inquirer from 'inquirer';
import { ContextChoices } from '../../../src/initializer/contextChoices';
import * as fs from 'fs';
import * as child from 'child_process';
import * as _ from 'lodash';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
let expect = chai.expect;

describe('StrykerInitializer', function () {
  let sut: StrykerInitializer;
  let sandbox: sinon.SinonSandbox;
  let initializerPromise: Promise<void>;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sut = new StrykerInitializer();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('initialize()', function () {
    const contextChoices: ContextChoices = {
      testRunner:
      {
        name: 'Mocha',
        npm: 'stryker-mocha-runner',
        config: {
          testRunner: 'mocha'
        }
      },
      testFramework:
      {
        name: 'Mocha',
        npm: '',
        config: {
          testFramework: 'mocha'
        }
      }
    };

    beforeEach(() => {
      sandbox.spy(sut, 'buildQuestions');
      sandbox.stub(sut, 'promptContextChoices').returns(Promise.resolve(contextChoices));
      sandbox.spy(sut, 'buildNpmPackagesArray');
      sandbox.stub(sut, 'installNpmDependencies');
      sandbox.stub(sut, 'installStrykerConfiguration');
      initializerPromise = sut.initialize();
    });

    it('should call buildQuestions()', function () {
      initializerPromise.then(function () {
        expect(sut.buildQuestions).to.have.been.calledOnce;
      });
    });

    it('should call promptContextChoices()', function () {
      expect(sut.promptContextChoices).to.have.been.calledOnce;
    });

    it('should call buildNpmPackagesArray()', function (done) {
      initializerPromise.then(function () {
        expect(sut.buildNpmPackagesArray).to.have.been.calledOnce;
        done();
      });
    });

    it('should call installNpmDependencies()', function (done) {
      initializerPromise.then(function () {
        expect(sut.installNpmDependencies).to.have.been.calledOnce;
        done();
      });
    });

    it('should call installStrykerConfiguration()', function (done) {
      initializerPromise.then(function () {
        expect(sut.installStrykerConfiguration).to.have.been.calledOnce;
        done();
      });
    });
  });

  describe('promptContextChoices()', function () {
    const buildQuestions: Inquirer.Questions =
      [
        {
          type: 'list',
          name: 'testRunner',
          message: 'Which Test Runner do you use?',
          choices: ['Mocha', 'Karma'],
          default: 'Mocha'
        },
        {
          type: 'list',
          name: 'testFramework',
          message: 'Which Test Framework do you use?',
          choices: ['Mocha', 'Jasmine'],
          default: 'Mocha'
        }
      ];

    let contextChoicesPromise: Promise<ContextChoices>;
    const contextChoices: ContextChoices = {
      testRunner:
      {
        name: 'Mocha',
        npm: 'stryker-mocha-runner',
        config: { testRunner: 'mocha' }
      },
      testFramework:
      {
        name: 'Mocha',
        npm: '',
        config: { testFramework: 'mocha' }
      }
    };

    let inquirer = Inquirer;

    beforeEach(() => {
      inquirer.prompt = sandbox.stub().resolves({ 'testFramework': 'Mocha', 'testRunner': 'Mocha' });
      contextChoicesPromise = sut.promptContextChoices(buildQuestions);
    });

    it('should call inquirer.prompt', function () {
      expect(inquirer.prompt).to.have.been.called;
    });

    it('should return contextChoices', function () {
      return expect(contextChoicesPromise).eventually.deep.equal(contextChoices);
    });
  });

  describe('buildQuestions()', function () {
    const matchQuestions: Inquirer.Questions = [
      {
        type: 'list',
        name: 'testRunner',
        message: 'Which Test Runner do you use?',
        choices: ['Mocha', 'Karma'],
        default: 'Mocha'
      },
      {
        type: 'list',
        name: 'testFramework',
        message: 'Which Test Framework do you use?',
        choices: ['Mocha', 'Jasmine'],
        default: 'Mocha'
      }
    ];

    let buildQuestions: Inquirer.Questions;

    beforeEach(() => {
      buildQuestions = sut.buildQuestions();
    });

    it('should return questions', function () {
      expect(buildQuestions).deep.equal(matchQuestions);
    });
  });

  describe('buildNpmPackagesArray()', function () {
    let buildNpmPackagesArray: Array<String>;

    describe('is called with an contextChoices that have undefined testRunner and testFramework', function () {
      const contextChoices: ContextChoices = {
        testRunner: undefined,
        testFramework: undefined
      };

      beforeEach(() => {
        buildNpmPackagesArray = sut.buildNpmPackagesArray(contextChoices);
      });

      it('should only return stryker-html-reporter', function () {
        expect(buildNpmPackagesArray).to.eql(['stryker-html-reporter']);
      });
    });

    describe('is called with an contextChoices that has no npm value', function () {
      const contextChoices: ContextChoices = {
        testRunner:
        {
          name: '',
          npm: '',
          config: {}
        },
        testFramework:
        {
          name: '',
          npm: '',
          config: {}
        }
      };

      beforeEach(() => {
        buildNpmPackagesArray = sut.buildNpmPackagesArray(contextChoices);
      });

      it('should only return stryker-html-reporter', function () {
        expect(buildNpmPackagesArray).to.eql(['stryker-html-reporter']);
      });
    });

    describe('is called with an contextChoices with that contains npm values', function () {
      const contextChoices: ContextChoices = {
        testRunner:
        {
          name: '',
          npm: 'b',
          config: {}
        },
        testFramework:
        {
          name: '',
          npm: 'a',
          config: {}
        }
      };

      beforeEach(() => {
        buildNpmPackagesArray = sut.buildNpmPackagesArray(contextChoices);
      });

      it('should return stryker-html-reporter, a and b', function () {
        expect(buildNpmPackagesArray).to.eql(['stryker-html-reporter', 'a', 'b']);
      });
    });
  });

  describe('installNpmDependencies()', function () {
    beforeEach(() => {
      sandbox.stub(console, 'log');
      sandbox.stub(child, 'execSync');
    });

    describe('is called no Npm dependencies', function () {
      const npmDependencies: Array<String> = [];

      beforeEach(() => {
        sut.installNpmDependencies(npmDependencies);
      });

      it('should NOT print "Installing NPM dependencies..." to the console', function () {
        expect(console.log).not.to.be.called;
      });

      it('should not run npm install', function () {
        expect(child.execSync).not.to.be.called;
      });
    });

    describe('is called with 2 Npm dependencies', function () {
      const npmDependencies: Array<String> = ['a', 'b'];

      beforeEach(() => {
        sut.installNpmDependencies(npmDependencies);
      });

      it('should print "Installing NPM dependencies..." to the console', function () {
        expect(console.log).to.be.called;
      });

      it('should run npm install with 2 packages', function () {
        expect(child.execSync).to.be.calledWith('npm i a b --save-dev', { stdio: [0, 1, 2] });
      });
    });
  });

  describe('installStrykerConfiguration()', function () {

    describe('is called with an contextChoices that have undefined testRunner and testFramework', function () {
      const contextChoices: ContextChoices = {
        testRunner: undefined,
        testFramework: undefined
      };

      beforeEach(() => {
        sandbox.stub(fs, 'writeFile');
        sandbox.stub(console, 'log');
        sut.installStrykerConfiguration(contextChoices);
      });

      it('should print "Installing Stryker configuration..." to the console', function () {
        expect(console.log).to.be.calledWith('Installing Stryker configuration...');
      });

      it('should create a new config file', function () {
        expect(fs.writeFile).to.be.called;
      });
    });

    describe('is called with filled contextChoices', function () {
      const contextChoices: ContextChoices = {
        testRunner:
        {
          name: '',
          npm: '',
          config: { testRunner: 'b' }
        },
        testFramework:
        {
          name: '',
          npm: '',
          config: { testFramework: 'a' }
        }
      };

      beforeEach(() => {
        sandbox.stub(fs, 'writeFile');
        sandbox.stub(console, 'log');
        sandbox.stub(_, 'assign');
        sut.installStrykerConfiguration(contextChoices);
      });

      it('should print "Installing Stryker configuration..." to the console', function () {
        expect(console.log).to.be.calledWith('Installing Stryker configuration...');
      });

      it('should call the lodash assign twice (framework and testrunner)', function () {
        expect(_.assign).be.calledTwice;
      });

      it('should create a new config file', function () {
        expect(fs.writeFile).to.be.called;
      });
    });
  });

});