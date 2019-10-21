import inquirer = require('inquirer');
import Preset from './Preset';
import PresetConfiguration from './PresetConfiguration';

const handbookUrl = 'https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/react.md#react';

/**
 * More information can be found in the Stryker handbook:
 * https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/react.md#react
 */
export class ReactPreset implements Preset {
  public readonly name = 'react';
  private readonly generalDependencies = ['@stryker-mutator/core', '@stryker-mutator/jest-runner', '@stryker-mutator/html-reporter'];

  private readonly sharedConfig = `testRunner: 'jest',
    reporters: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'off',
    jest: {
      projectType: 'react'
    }
  `;

  private readonly tsxDependencies = ['@stryker-mutator/typescript', ...this.generalDependencies];
  private readonly tsxConf = `{
      mutate: ['src/**/*.ts?(x)', '!src/**/*@(.test|.spec|Spec).ts?(x)'],
      mutator: 'typescript',
      ${this.sharedConfig}
    }`;

  private readonly jsxDependencies = ['@stryker-mutator/javascript-mutator', ...this.generalDependencies];
  private readonly jsxConf = `{
      mutate: ['src/**/*.js?(x)', '!src/**/*@(.test|.spec|Spec).js?(x)'],
      mutator: 'javascript',
      ${this.sharedConfig}
    }`;

  public async createConfig(): Promise<PresetConfiguration> {
    const choices: Array<inquirer.ChoiceType<string>> = ['JSX', 'TSX'];
    const answers = await inquirer.prompt<{ choice: string }>({
      choices,
      message: 'Is your project a JSX project or a TSX project?',
      name: 'choice',
      type: 'list'
    });
    return this.load(answers.choice);
  }
  private load(choice: string): PresetConfiguration {
    if (choice === 'JSX') {
      return { config: this.jsxConf, handbookUrl, dependencies: this.jsxDependencies };
    } else if (choice === 'TSX') {
      return { config: this.tsxConf, handbookUrl, dependencies: this.tsxDependencies };
    } else {
      throw new Error(`Invalid project type ${choice}`);
    }
  }
}
