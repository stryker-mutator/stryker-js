import { testInjector } from '@stryker-mutator/test-helpers';
import { resolveFromCwd } from '@stryker-mutator/util';
import { expect } from 'chai';
import { execaCommand } from 'execa';
import inquirer from 'inquirer';
import sinon from 'sinon';

import { coreTokens } from '../../../src/di/index.js';

import { AngularInitializer } from '../../../src/initializer/custom-initializers/angular-initializer.js';
import { ReactInitializer } from '../../../src/initializer/custom-initializers/react-initializer.js';
import { VueJsInitializer } from '../../../src/initializer/custom-initializers/vue-js-initializer.js';

describe('CustomInitializers', () => {
  let inquirerPrompt: sinon.SinonStub;

  beforeEach(() => {
    inquirerPrompt = sinon.stub(inquirer, 'prompt');
  });
  describe.only(AngularInitializer.name, () => {
    let sut: AngularInitializer;
    let execaStub: sinon.SinonStubbedMember<typeof execaCommand>;
    let resolveStub: sinon.SinonStubbedMember<typeof resolveFromCwd>;

    beforeEach(() => {
      execaStub = sinon.stub();
      resolveStub = sinon.stub();
      sut = testInjector.injector
        .provideValue(coreTokens.execa, execaStub as unknown as typeof execaCommand)
        .provideValue(coreTokens.resolveFromCwd, resolveStub)
        .injectClass(AngularInitializer);
    });

    it('should have the name "angular-cli"', () => {
      expect(sut.name).to.eq('angular-cli');
    });

    it('should use the angular-cli', async () => {
      const config = await sut.createConfig();
      expect((config.config.karma as any).projectType).to.eq('angular-cli');
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
