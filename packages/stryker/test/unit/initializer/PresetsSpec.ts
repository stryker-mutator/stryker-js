import { expect } from 'chai';
import { AngularPreset } from '../../../src/initializer/presets/AngularPreset';
import { ReactPreset } from '../../../src/initializer/presets/ReactPreset';
import * as inquirer from 'inquirer';
import { VueJsPreset } from '../../../src/initializer/presets/VueJsPreset';
import * as sinon from 'sinon';

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

    it('should mutate typescript', async () => {
      const config = await angularPreset.createConfig();
      expect(config.config).to.contain(`mutator: 'typescript'`);
    });

    it('should use the angular-cli', async () => {
      const config = await angularPreset.createConfig();
      expect(config.config).to.contain(`projectType: 'angular-cli'`);
    });
  });

  describe('ReactPreset', () => {
    let reactPreset: ReactPreset;

    beforeEach(() => {
      reactPreset = new ReactPreset();
    });

    it('should have the name "react"', () => {
      expect(reactPreset.name).to.eq('react');
    });

    it('should mutate typescript when TSX is chosen', async () => {
      inquirerPrompt.resolves({
        choice: 'TSX'
      });
      const config = await reactPreset.createConfig();
      expect(config.config).to.contain(`mutator: 'typescript'`);
    });

    it('should install stryker-typescript when TSX is chosen', async () => {
      inquirerPrompt.resolves({
        choice: 'TSX'
      });
      const config = await reactPreset.createConfig();
      expect(config.dependencies).to.include('stryker-typescript');
    });

    it('should mutate javascript when JSX is chosen', async () => {
      inquirerPrompt.resolves({
        choice: 'JSX'
      });
      const config = await reactPreset.createConfig();
      expect(config.config).to.include(`mutator: 'javascript'`);
    });

    it('should install stryker-javascript-mutator when JSX is chosen', async () => {
      inquirerPrompt.resolves({
        choice: 'JSX'
      });
      const config = await reactPreset.createConfig();
      expect(config.dependencies).to.include('stryker-javascript-mutator');
    });
  });

  describe('VueJsPreset', () => {
    let vueJsPreset: VueJsPreset;

    beforeEach(() => {
      vueJsPreset = new VueJsPreset();
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'karma'
      });
    });

    it('should have the name "vueJs"', () => {
      expect(vueJsPreset.name).to.eq('vueJs');
    });

    it('should use the vue mutator', async () => {
      const config = await vueJsPreset.createConfig();
      expect(config.config).to.contain(`mutator: 'vue'`);
    });

    it('should install stryker-karma-runner when karma is chosen', async () => {
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'karma'
      });
      const config = await vueJsPreset.createConfig();
      expect(config.dependencies).to.include('stryker-karma-runner');
    });

    it('should install stryker-jest-runner when jest is chosen', async () => {
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'jest'
      });
      const config = await vueJsPreset.createConfig();
      expect(config.dependencies).to.include('stryker-jest-runner');
    });

    it('should install stryker-typescript when typescript is chosen', async () => {
      inquirerPrompt.resolves({
        script: 'typescript',
        testRunner: 'karma'
      });
      const config = await vueJsPreset.createConfig();
      expect(config.dependencies).to.include('stryker-typescript');
    });

    it('should install stryker-javascript-mutator when javascript is chosen', async () => {
      inquirerPrompt.resolves({
        script: 'javascript',
        testRunner: 'karma'
      });
      const config = await vueJsPreset.createConfig();
      expect(config.dependencies).to.include('stryker-javascript-mutator');
    });
  });
});
