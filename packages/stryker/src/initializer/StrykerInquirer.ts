import * as inquirer from 'inquirer';
import PromptOption from './PromptOption';

export interface PromptResult {
  additionalNpmDependencies: string[];
  additionalConfig: object;
}

export class StrykerInquirer {

  public async promptTestRunners(options: PromptOption[]): Promise<PromptOption> {
    const answers = await inquirer.prompt({
      type: 'list',
      name: 'testRunner',
      message: 'Which test runner do you want to use?',
      choices: options.map(_ => _.name),
      default: 'Mocha'
    });
    return options.filter(_ => _.name === answers['testRunner'])[0] || { name: 'mocha', npm: 'stryker-mocha-runner' };
  }

  public async promptTestFrameworks(options: PromptOption[]): Promise<PromptOption> {
    const answers = await inquirer.prompt({
      type: 'list',
      name: 'testFramework',
      message: 'Which test framework do you want to use?',
      choices: options.map(_ => _.name),
    });
    return options.filter(_ => _.name === answers['testFramework'])[0];
  }

  public async promptReporters(options: PromptOption[]): Promise<PromptOption[]> {
    const answers = await inquirer.prompt({
      type: 'checkbox',
      name: 'reporters',
      message: 'Which reporter(s) do you want to use?',
      choices: options.map(_ => _.name),
      default: ['clear-text', 'progress']
    });
    return options.filter(option => (answers['reporters'] as string[]).some(reporterName => option.name === reporterName));
  }
}