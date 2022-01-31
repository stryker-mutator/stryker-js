import { expect } from 'chai';
import inquirer from 'inquirer';
import sinon from 'sinon';

import { AngularPreset } from '../../../src/initializer/presets/angular-preset.js';
import { ReactPreset } from '../../../src/initializer/presets/react-preset.js';
import { VueJsPreset } from '../../../src/initializer/presets/vue-js-preset.js';

describe('Presets', () => {
  let inquirerPrompt: sinon.SinonStub;

  beforeEach(() => {
    inquirerPrompt = sinon.stub(inquirer, 'prompt');
  });
  describe('AngularPreset', () => {
    let angularPreset: AngularPreset;

    beforeEach(() => {
      angularPreset = new AngularPreset();
    });

    it('should have the name "angular-cli"', () => {
      expect(angularPreset.name).to.eq('angular-cli');
    });

    it('should use the angular-cli', async () => {
      const config = await angularPreset.createConfig();
      expect((config.config.karma as any).projectType).to.eq('angular-cli');
    });
  });

  describe('ReactPreset', () => {
    let reactPreset: ReactPreset;

    beforeEach(() => {
      reactPreset = new ReactPreset();
    });

    it('should have the name "create-react-app"', () => {
      expect(reactPreset.name).to.eq('create-react-app');
    });
  });

  describe('VueJsPreset', () => {
    let vueJsPreset: VueJsPreset;

    beforeEach(() => {
      vueJsPreset = new VueJsPreset();
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'jest',
      });
    });

    it('should have the name "vue-cli"', () => {
      expect(vueJsPreset.name).to.eq('vue-cli');
    });

    it('should install @stryker-mutator/mocha-runner when mocha is chosen', async () => {
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'mocha',
      });
      const config = await vueJsPreset.createConfig();
      expect(config.dependencies).to.include('@stryker-mutator/mocha-runner');
    });

    it('should install @stryker-mutator/jest-runner when jest is chosen', async () => {
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'jest',
      });
      const config = await vueJsPreset.createConfig();
      expect(config.dependencies).to.include('@stryker-mutator/jest-runner');
    });
  });
});
