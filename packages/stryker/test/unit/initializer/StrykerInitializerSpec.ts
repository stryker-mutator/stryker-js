import * as child from 'child_process';
import * as fs from 'mz/fs';
import * as sinon from 'sinon';
import { expect } from 'chai';
import * as inquirer from 'inquirer';
import StrykerInitializer from '../../../src/initializer/StrykerInitializer';
// import { StrykerConfigOptions } from '../../../src/initializer/StrykerConfigOptions';

describe('StrykerInitializer', () => {
  let sut: StrykerInitializer;
  let sandbox: sinon.SinonSandbox;
  let inquirerPrompt: sinon.SinonStub;
  let childExecSync: sinon.SinonStub;
  let fsWriteFile: sinon.SinonStub;
  let log: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    log = sandbox.stub();
    inquirerPrompt = sandbox.stub(inquirer, 'prompt');
    childExecSync = sandbox.stub(child, 'execSync');
    fsWriteFile = sandbox.stub(fs, 'writeFile');
    sut = new StrykerInitializer(log);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe.only('initialize()', () => {

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