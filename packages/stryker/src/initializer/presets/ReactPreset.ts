import StrykerPreset from './StrykerPreset';
import inquirer = require('inquirer');

export class ReactPreset extends StrykerPreset {

    public dependencies = [
      'stryker',
      'stryker-jest-runner',
      'stryker-html-reporter'
    ];
    public conf: string;

    private readonly tsxDependencies = ['stryker-typescript', ...this.dependencies];
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

    private readonly jsxDependencies = ['stryker-javascript-mutator', ...this.dependencies];
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

    public async prompt(): Promise<void> {
      const choices: inquirer.ChoiceType[] = ['JSX', 'TSX'];
      const answers = await inquirer.prompt<{ choice: string }>({
        choices,
        message: 'Is your project a JSX project or a TSX project?',
        name: 'choice',
        type: 'list'
      });
      this.load(answers.choice);
    }
    private load(choice: string) {
      if (choice === 'JSX') {
        this.dependencies = this.jsxDependencies;
        this.conf = this.jsxConf;
      } else if (choice === 'TSX') {
        this.dependencies = this.tsxDependencies;
        this.conf = this.tsxConf;
      } else {
        throw new Error(`Invalid project type ${choice}`);
      }
    }
}
