import fs from 'fs/promises';
import os from 'os';

import sinon from 'sinon';
import { expect } from 'chai';
import { execaCommand, ExecaReturnValue } from 'execa';
import inquirer from 'inquirer';
import { testInjector } from '@stryker-mutator/test-helpers';
import { resolveFromCwd } from '@stryker-mutator/util';
import { PartialStrykerOptions } from '@stryker-mutator/api/core';

import { coreTokens } from '../../../src/di/index.js';

import { AngularInitializer } from '../../../src/initializer/custom-initializers/angular-initializer.js';
import { ReactInitializer } from '../../../src/initializer/custom-initializers/react-initializer.js';
import { VueJsInitializer } from '../../../src/initializer/custom-initializers/vue-js-initializer.js';
import { fileUtils } from '../../../src/utils/file-utils.js';

describe('CustomInitializers', () => {
  let inquirerPrompt: sinon.SinonStub;

  beforeEach(() => {
    inquirerPrompt = sinon.stub(inquirer, 'prompt');
  });

  describe(AngularInitializer.name, () => {
    let sut: AngularInitializer;
    let execaStub: sinon.SinonStubbedMember<typeof execaCommand>;
    let resolveStub: sinon.SinonStubbedMember<typeof resolveFromCwd>;
    let existsStub: sinon.SinonStubbedMember<typeof fileUtils.exists>;
    let readFileStub: sinon.SinonStubbedMember<typeof fs.readFile>;
    let cpusStub: sinon.SinonStubbedMember<typeof os.cpus>;

    beforeEach(() => {
      existsStub = sinon.stub(fileUtils, 'exists');
      readFileStub = sinon.stub(fs, 'readFile');
      execaStub = sinon.stub();
      resolveStub = sinon.stub();
      cpusStub = sinon.stub(os, 'cpus');
      const sevenCores = [
        { model: 'Intel(R) Core(TM) i7' },
        { model: 'Intel(R) Core(TM) i7' },
        { model: 'Intel(R) Core(TM) i7' },
        { model: 'Intel(R) Core(TM) i7' },
        { model: 'Intel(R) Core(TM) i7' },
        { model: 'Intel(R) Core(TM) i7' },
        { model: 'Intel(R) Core(TM) i7' },
      ] as os.CpuInfo[];
      cpusStub.returns(sevenCores);
      sut = testInjector.injector
        .provideValue(coreTokens.execa, execaStub as unknown as typeof execaCommand)
        .provideValue(coreTokens.resolveFromCwd, resolveStub)
        .injectClass(AngularInitializer);
    });

    it('should have the name "angular-cli"', () => {
      expect(sut.name).to.eq('angular-cli');
    });

    it('should provide expected config', async () => {
      const { config } = await sut.createConfig();
      const expectedConfig: PartialStrykerOptions = {
        mutate: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/test.ts', '!src/environments/*.ts'],
        testRunner: 'karma',
        karma: {
          configFile: 'karma.conf.js',
          projectType: 'angular-cli',
          config: {
            browsers: ['ChromeHeadless'],
          },
        },
        reporters: ['progress', 'clear-text', 'html'],
        concurrency: 3,
        concurrency_comment: 'Recommended to use about half of your available cores when running stryker with angular',
        coverageAnalysis: 'perTest',
      };
      expect(config).deep.eq(expectedConfig);
    });

    it('should create a karma config when none is found and `@angular/cli` version supports it', async () => {
      // Arrange
      resolveStub.returns('./node_modules/@angular/cli/package.json');
      existsStub.resolves(false);
      readFileStub.resolves('{"version": "15.1.0"}');
      execaStub.resolves({ stdout: Buffer.from('') } as ExecaReturnValue<Buffer>);

      // Act
      await sut.createConfig();

      // Assert
      sinon.assert.calledOnceWithExactly(resolveStub, '@angular/cli/package.json');
      sinon.assert.calledOnceWithExactly(existsStub, 'karma.conf.js');
      sinon.assert.calledOnceWithExactly(execaStub, 'npx ng generate config karma');
      sinon.assert.calledOnceWithExactly(readFileStub, './node_modules/@angular/cli/package.json', 'utf8');
    });

    it('should not create a karma config when the `@angular/cli` version does not support it', async () => {
      // Arrange
      resolveStub.returns('./node_modules/@angular/cli/package.json');
      existsStub.resolves(false);
      readFileStub.resolves('{"version": "15.0.9"}'); // version 15.1 added the support
      execaStub.resolves({ stdout: Buffer.from('') } as ExecaReturnValue<Buffer>);

      // Act
      await sut.createConfig();

      // Assert
      sinon.assert.notCalled(execaStub);
    });

    it('should not create a karma config when it already exists', async () => {
      // Arrange
      resolveStub.returns('./node_modules/@angular/cli/package.json');
      existsStub.resolves(true);
      readFileStub.resolves('{"version": "16.0.0"}');
      execaStub.resolves({ stdout: Buffer.from('') } as ExecaReturnValue<Buffer>);

      // Act
      await sut.createConfig();

      // Assert
      sinon.assert.notCalled(execaStub);
    });

    it('should log details when creating a karma config', async () => {
      // Arrange
      resolveStub.returns('./node_modules/@angular/cli/package.json');
      existsStub.resolves(false);
      readFileStub.resolves('{"version": "15.1.0"}');
      execaStub.resolves({ stdout: 'Some detailed output' } as unknown as ExecaReturnValue<Buffer>);

      // Act
      await sut.createConfig();

      // Assert
      sinon.assert.calledWithExactly(testInjector.logger.info, 'No "karma.conf.js" file found, running command: "npx ng generate config karma"');
      sinon.assert.calledWithExactly(testInjector.logger.info, '\nSome detailed output');
    });

    it('should log a warning, but not crash when discovering angular-cli version fails', async () => {
      // Arrange
      const expectedError = new Error('Expected error');
      resolveStub.returns('./node_modules/@angular/cli/package.json');
      existsStub.resolves(false);
      readFileStub.rejects(expectedError);

      // Act
      await sut.createConfig();

      // Assert
      sinon.assert.calledWithExactly(
        testInjector.logger.warn,
        `Could not discover your local angular-cli version. Continuing without generating karma configuration. ${expectedError.stack}`
      );
    });
  });

  describe(ReactInitializer.name, () => {
    let sut: ReactInitializer;

    beforeEach(() => {
      sut = testInjector.injector.injectClass(ReactInitializer);
    });

    it('should have the name "create-react-app"', () => {
      expect(sut.name).to.eq('create-react-app');
    });
  });

  describe(VueJsInitializer.name, () => {
    let sut: VueJsInitializer;

    beforeEach(() => {
      sut = testInjector.injector.injectClass(VueJsInitializer);
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'jest',
      });
    });

    it('should have the name "vue-cli"', () => {
      expect(sut.name).to.eq('vue-cli');
    });

    it('should install @stryker-mutator/mocha-runner when mocha is chosen', async () => {
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'mocha',
      });
      const config = await sut.createConfig();
      expect(config.dependencies).to.include('@stryker-mutator/mocha-runner');
    });

    it('should install @stryker-mutator/jest-runner when jest is chosen', async () => {
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'jest',
      });
      const config = await sut.createConfig();
      expect(config.dependencies).to.include('@stryker-mutator/jest-runner');
    });
  });
});
