import * as child from 'child_process';
import * as fs from 'mz/fs';
import * as sinon from 'sinon';
import { expect } from 'chai';
import * as inquirer from 'inquirer';
import StrykerInitializer from '../../../src/initializer/StrykerInitializer';
import * as restClient from 'typed-rest-client/RestClient';

describe('StrykerInitializer', () => {
  let sut: StrykerInitializer;
  let sandbox: sinon.SinonSandbox;
  let inquirerPrompt: sinon.SinonStub;
  let childExecSync: sinon.SinonStub;
  let fsWriteFile: sinon.SinonStub;
  let fsExistsSync: sinon.SinonStub;
  let restClientNew: sinon.SinonStub;
  let restClientGet: sinon.SinonStub;
  let log: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    log = sandbox.stub();
    inquirerPrompt = sandbox.stub(inquirer, 'prompt');
    childExecSync = sandbox.stub(child, 'execSync');
    fsWriteFile = sandbox.stub(fs, 'writeFile');
    fsExistsSync = sandbox.stub(fs, 'existsSync');
    restClientGet = sandbox.stub().returns({
      statusCode: 404
    });
    restClientNew = sandbox.stub(restClient, 'RestClient').returns({
      get: restClientGet
    });
    sut = new StrykerInitializer(log);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialize()', () => {

    describe('when everything goes well', () => {
      beforeEach(() => {
        fsWriteFile.resolves({});
      });

      it('should prompt for test runner and test framework', async () => {
        inquirerPrompt.resolves({ 'testFramework': 'Mocha', 'testRunner': 'Mocha' });
        await sut.initialize();
        expect(inquirer.prompt).to.have.been.calledWith(sinon.match((questions: inquirer.Question[]) => {
          const testRunner = questions[0];
          const testFramework = questions[1];
          expect(testRunner.type).to.eq('list');
          expect(testRunner.name).to.eq('testRunner');
          expect(testFramework.type).to.eq('list');
          expect(testFramework.name).to.eq('testFramework');
          return true;
        }));
      });

      describe('when additional testrunners are found on npm', () => {

        beforeEach(() => {
          restClientGet.returns({
            statusCode: 200,
            result: {
              total: 1,
              results: [{ package: { name: 'stryker-jest-runner' } }]
            }
          });
          inquirerPrompt.resolves({ 'testFramework': 'Mocha', 'testRunner': 'Mocha' });
        });

        it('should prompt the new testrunners as options', async () => {
          await sut.initialize();
          expect(inquirer.prompt).to.have.been.calledWith(sinon.match((questions: inquirer.Question[]) => {
            const testRunner = questions[0];
            expect(testRunner.choices).to.deep.include('Jest');
            return true;
          }));
        });

        describe('when new testrunner jest is selected', () => {
          beforeEach(() => {
            inquirerPrompt.resolves({ 'testFramework': 'Other/none', 'testRunner': 'Jest' });
          });

          it('should install jest-runner and html-reporter', async () => {
            await sut.initialize();
            expect(log).to.have.been.calledWith('Installing NPM dependencies...');
            expect(child.execSync).to.have.been.calledWith('npm i --save-dev stryker-jest-runner stryker-html-reporter', { stdio: [0, 1, 2] });
          });

          it('should configure stryker with jest', async () => {
            await sut.initialize();
            expect(log).to.have.been.calledWith('Writing stryker.conf.js...');
            expect(fs.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('"testRunner": "jest"'));
          });
        });
      });

      describe('when karm.conf.js is found in project directory', () => {

        beforeEach(() => {
          fsExistsSync.returns(true);
          inquirerPrompt.resolves({ 'testFramework': 'Jasmine', 'testRunner': 'Karma' });
        });
        
        it('should log that karma.conf.js is found', async () => {
          await sut.initialize();
          expect(log).to.have.been.calledWith('Found karma.conf.js');
        });

        it('should select karma as default testrunner', async () => {
          await sut.initialize();
          expect(inquirer.prompt).to.have.been.calledWith(sinon.match((questions: inquirer.Question[]) => {
            const testRunner = questions[0];
            expect(testRunner.default).to.eq('Karma');
            return true;
          }));
        });

        it('should configure the karma.conf.js in stryker.conf.js', async () => {
          await sut.initialize();
          expect(fs.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('"karmaConfigFile": "./karma.conf.js"'));
        });
      });

      describe('when answered with mocha', () => {

        beforeEach(() => inquirerPrompt.resolves({ testFramework: 'Mocha', testRunner: 'Mocha' }));

        it('should install mocha-runner and html-reporter', async () => {
          await sut.initialize();
          expect(log).to.have.been.calledWith('Installing NPM dependencies...');
          expect(child.execSync).to.have.been.calledWith('npm i --save-dev stryker-mocha-runner stryker-html-reporter', { stdio: [0, 1, 2] });
        });

        it('should configure stryker with mocha', async () => {
          await sut.initialize();
          expect(log).to.have.been.calledWith('Writing stryker.conf.js...');
          expect(fs.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('"testRunner": "mocha"')
            .and(sinon.match('"testFramework": "mocha"'))
            .and(sinon.match('"reporter"'))
            .and(sinon.match('"html"'))
            .and(sinon.match('"progress"')));
        });

      });

      describe('when answered with jasmine/karma', () => {

        beforeEach(() => inquirerPrompt.resolves({ testFramework: 'Jasmine', testRunner: 'Karma' }));

        it('should install karma-runner, jasmine and html-reporter', async () => {
          await sut.initialize();
          expect(child.execSync).to.have.been.calledWith('npm i --save-dev stryker-jasmine stryker-karma-runner stryker-html-reporter', { stdio: [0, 1, 2] });
        });

        it('should configure stryker with jasmine/karma', async () => {
          await sut.initialize();
          expect(log).to.have.been.calledWith('Writing stryker.conf.js...');
          expect(fs.writeFile).to.have.been.calledWith('stryker.conf.js', sinon.match('"testRunner": "karma"')
            .and(sinon.match('"testFramework": "jasmine"'))
            .and(sinon.match('"reporter"'))
            .and(sinon.match('"html"'))
            .and(sinon.match('"progress"')));
        });
      });
    });

    describe('when install fails', () => {
      beforeEach(() => {
        fsWriteFile.resolves({});
        childExecSync.throws('error');
        inquirerPrompt.resolves({ 'testFramework': 'Mocha', 'testRunner': 'Mocha' });
      });

      it('should recover', async () => {
        await sut.initialize();
        expect(log).to.have.been.calledWith('An error occurred during installation, please try it yourself: "npm i --save-dev stryker-mocha-runner stryker-html-reporter"');
        expect(fs.writeFile).to.have.been.called;
      });
    });

    describe('when writing of the config file fails', () => {
      const expectedError = new Error('something');
      beforeEach(() => {
        fsWriteFile.rejects(expectedError);
        inquirerPrompt.resolves({ 'testFramework': 'Mocha', 'testRunner': 'Mocha' });
      });

      it('should reject with that error', () => {
        return expect(sut.initialize()).to.eventually.be.rejectedWith(expectedError);
      });
    });
  });
});