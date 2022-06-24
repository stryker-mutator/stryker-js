import inquirer from 'inquirer';
import { PartialStrykerOptions } from '@stryker-mutator/api/core';

import { Preset } from './preset.js';
import { PresetConfiguration } from './preset-configuration.js';

const guideUrl = 'https://stryker-mutator.io/docs/stryker-js/guides/vuejs';

/**
 * More information can be found in the Stryker handbook:
 * https://stryker-mutator.io/docs/stryker-js/guides/vuejs
 */
export class VueJsPreset implements Preset {
  public readonly name = 'vue-cli';

  private readonly jestConf: PartialStrykerOptions = {
    testRunner: 'jest',
    mutator: {
      plugins: [],
    },
    jest: {
      // config: require('path/to/your/custom/jestConfig.js')
    },
    reporters: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'off',
  };
  private readonly mochaConf: PartialStrykerOptions = {
    testRunner: 'mocha',
    mutator: {
      plugins: [],
    },
    mochaOptions: {
      require: ['@vue/cli-plugin-unit-mocha/setup.js'],
      spec: ['dist/js/chunk-vendors.js', 'dist/js/tests.js'],
    },
    buildCommand: 'webpack --config webpack.config.stryker.js',
    reporters: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'perTest',
  };

  public async createConfig(): Promise<PresetConfiguration> {
    const testRunnerChoices = ['mocha', 'jest'];
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
      guideUrl,
      additionalConfigFiles: this.getAdditionalConfigFiles(chosenTestRunner),
    };
  }

  private getConfig(testRunner: string) {
    if (testRunner === 'mocha') {
      return this.mochaConf;
    } else if (testRunner === 'jest') {
      return this.jestConf;
    } else {
      throw new Error(`Invalid test runner chosen: ${testRunner}`);
    }
  }

  private getAdditionalConfigFiles(testRunner: string): Record<string, string> | undefined {
    if (testRunner === 'mocha') {
      return {
        'webpack.config.stryker.js': `
const glob = require('glob');

// Set env
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.VUE_CLI_BABEL_TARGET_NODE = 'true';
process.env.VUE_CLI_TRANSPILE_BABEL_RUNTIME = 'true';

// Load webpack config
const conf = require('@vue/cli-service/webpack.config.js');

// Override the entry files
conf.entry = {
  // Choose your test files here:
  tests: glob.sync('{test,tests}/**/*+(spec).js').map((fileName) => \`./\${fileName}\`),
};

module.exports = conf;
`,
      };
    }
    return;
  }

  private createDependencies(testRunner: string): string[] {
    const dependencies = [];
    dependencies.push(...this.getTestRunnerDependency(testRunner));
    return dependencies;
  }

  private getTestRunnerDependency(testRunner: string): string[] {
    if (testRunner === 'mocha') {
      return ['@stryker-mutator/mocha-runner', 'glob', 'webpack-cli'];
    } else if (testRunner === 'jest') {
      return ['@stryker-mutator/jest-runner'];
    } else {
      throw new Error(`Invalid test runner chosen: ${testRunner}`);
    }
  }
}
