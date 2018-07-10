import * as inquirer from 'inquirer';
import PromptOption from './PromptOption';

export interface PromptResult {
  additionalNpmDependencies: string[];
  additionalConfig: object;
}

export class StrykerInquirer {

  public async promptTestRunners(options: PromptOption[]): Promise<PromptOption> {
    const answers = await inquirer.prompt<{ testRunner: string }>({
      type: 'list',
      name: 'testRunner',
      message: 'Which test runner do you want to use?',
      choices: options.map(_ => _.name),
      default: 'Mocha'
    });
    return options.filter(_ => _.name === answers.testRunner)[0] || { name: 'mocha', npm: 'stryker-mocha-runner' };
  }

  public async promptTestFrameworks(options: PromptOption[]): Promise<PromptOption> {
    const answers = await inquirer.prompt<{ testFramework: string }>({
      type: 'list',
      name: 'testFramework',
      message: 'Which test framework do you want to use?',
      choices: options.map(_ => _.name),
    });
    return options.filter(_ => _.name === answers.testFramework)[0];
  }

  public async promptMutator(options: PromptOption[]): Promise<PromptOption> {
    const answers = await inquirer.prompt<{ mutator: string }>({
      type: 'list',
      name: 'mutator',
      message: 'What kind of code do you want to mutate?',
      choices: options.map(_ => _.name)
    });
    return options.filter(_ => _.name === answers.mutator)[0];
  }

  public async promptTranspilers(options: PromptOption[]): Promise<PromptOption[]> {
    const answers = await inquirer.prompt<{ transpilers: string[] }>({
      type: 'checkbox',
      name: 'transpilers',
      message: '[optional] What kind transformations should be applied to your code?',
      choices: options.map(_ => _.name)
    });
    return options.filter(option => answers.transpilers.some(transpilerName => option.name === transpilerName));
  }

  public async promptReporters(options: PromptOption[]): Promise<PromptOption[]> {
    const answers = await inquirer.prompt<{ reporters: string[] }>({
      type: 'checkbox',
      name: 'reporters',
      message: 'Which reporter(s) do you want to use?',
      choices: options.map(_ => _.name),
      default: ['clear-text', 'progress']
    });
    return options.filter(option => answers.reporters.some(reporterName => option.name === reporterName));
  }

  public async promptPackageManager(options: PromptOption[]): Promise<PromptOption> {
    const answers = await inquirer.prompt<{ packageManager: string }>({
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager do you want to use?',
      choices: options.map(_ => _.name),
      default: ['npm']
    });
    return options.filter(_ => _.name === answers['packageManager'])[0];
  }
}