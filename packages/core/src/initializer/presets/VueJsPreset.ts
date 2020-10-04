import inquirer = require('inquirer');
import { StrykerOptions } from '@stryker-mutator/api/core';

import Preset from './Preset';
import PresetConfiguration from './PresetConfiguration';

const handbookUrl = 'https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/vuejs.md#vuejs';

/**
 * More information can be found in the Stryker handbook:
 * https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/vuejs.md#vuejs
 */
export class VueJsPreset implements Preset {
  public readonly name = 'vueJs';

  private readonly jestConf: Partial<StrykerOptions> = {
    testRunner: 'jest',
    jest: {
      // config: require('path/to/your/custom/jestConfig.js')
    },
    reporters: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'off',
  };
  private readonly karmaConf: Partial<StrykerOptions> = {
    testRunner: 'karma',
    karma: {
      configFile: 'test/unit/karma.conf.js',
      config: {
        browsers: ['ChromeHeadless'],
      },
    },
    reporters: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'perTest',
  };

  public async createConfig(): Promise<PresetConfiguration> {
    const testRunnerChoices = ['karma', 'jest'];
    const testRunnerAnswers = await inquirer.prompt<{ testRunner: string }>({
      choices: testRunnerChoices,
      message: 'Which test runner do you want to use?',
      name: 'testRunner',
      type: 'list',
    });
    const chosenTestRunner = testRunnerAnswers.testRunner;
    return {
      config: this.getConfig(chosenTestRunner),
      dependencies: this.createDependencies(chosenTestRunner),
      handbookUrl,
    };
  }

  private getConfig(testRunner: string) {
    if (testRunner === 'karma') {
      return this.karmaConf;
    } else if (testRunner === 'jest') {
      return this.jestConf;
    } else {
      throw new Error(`Invalid test runner chosen: ${testRunner}`);
    }
  }

  private createDependencies(testRunner: string): string[] {
    const dependencies = ['@stryker-mutator/core'];
    dependencies.push(this.getTestRunnerDependency(testRunner));
    return dependencies;
  }

  private getTestRunnerDependency(testRunner: string): string {
    if (testRunner === 'karma') {
      return '@stryker-mutator/karma-runner';
    } else if (testRunner === 'jest') {
      return '@stryker-mutator/jest-runner';
    } else {
      throw new Error(`Invalid test runner chosen: ${testRunner}`);
    }
  }
}
