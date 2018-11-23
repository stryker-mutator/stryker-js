import StrykerPreset from './StrykerPreset';
import inquirer = require('inquirer');
import { StrykerPresetConfig } from './StrykerConf';

/**
 * More information can be found in the Stryker handbook:
 * https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/react.md#react
 */
export class ReactPreset extends StrykerPreset {

    private readonly generalDependencies = [
      'stryker',
      'stryker-jest-runner',
      'stryker-html-reporter'
    ];

    private readonly tsxDependencies = ['stryker-typescript', ...this.generalDependencies];
    private readonly tsxConf = `{
      mutate: ['src/**/*.ts?(x)', '!src/**/*@(.test|.spec|Spec).ts?(x)'],
      mutator: 'typescript',
      testRunner: 'jest',
      reporters: ['progress', 'clear-text', 'html'],
      coverageAnalysis: 'off',
      jest: {
        projectType: 'react'
      }
    }`;

    private readonly jsxDependencies = ['stryker-javascript-mutator', ...this.generalDependencies];
    private readonly jsxConf = `{
      mutate: ['src/**/*.js?(x)', '!src/**/*@(.test|.spec|Spec).js?(x)'],
      mutator: 'javascript',
      testRunner: 'jest',
      reporters: ['progress', 'clear-text', 'html'],
      coverageAnalysis: 'off',
      jest: {
        projectType: 'react'
      }
    }`;

    public async createConfig(): Promise<StrykerPresetConfig> {
      const choices: inquirer.ChoiceType[] = ['JSX', 'TSX'];
      const answers = await inquirer.prompt<{ choice: string }>({
        choices,
        message: 'Is your project a JSX project or a TSX project?',
        name: 'choice',
        type: 'list'
      });
      return this.load(answers.choice);
    }
    private load(choice: string): StrykerPresetConfig {
      if (choice === 'JSX') {
        return new StrykerPresetConfig(this.jsxConf, this.jsxDependencies);
      } else if (choice === 'TSX') {
        return new StrykerPresetConfig(this.tsxConf, this.tsxDependencies);
      } else {
        throw new Error(`Invalid project type ${choice}`);
      }
    }
}
