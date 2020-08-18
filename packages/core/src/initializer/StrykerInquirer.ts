import * as inquirer from 'inquirer';

import CommandTestRunner from '../test-runner/CommandTestRunner';

import Preset from './presets/Preset';
import PromptOption from './PromptOption';

export interface PromptResult {
  additionalNpmDependencies: string[];
  additionalConfig: Record<string, unknown>;
}

export class StrykerInquirer {
  public async promptPresets(options: Preset[]): Promise<Preset | undefined> {
    const choices: Array<inquirer.ChoiceType<string>> = options.map((_) => _.name);
    choices.push(new inquirer.Separator());
    choices.push('None/other');
    const answers = await inquirer.prompt<{ preset: string }>({
      choices,
      message: 'Are you using one of these frameworks? Then select a preset configuration.',
      name: 'preset',
      type: 'list',
    });
    return options.find((_) => _.name === answers.preset);
  }

  public async promptTestRunners(options: PromptOption[]): Promise<PromptOption> {
    const choices: Array<inquirer.ChoiceType<string>> = options.map((_) => _.name);
    choices.push(new inquirer.Separator());
    choices.push(CommandTestRunner.runnerName);
    const answers = await inquirer.prompt<{ testRunner: string }>({
      choices,
      default: 'Mocha',
      message:
        'Which test runner do you want to use? If your test runner isn\'t listed here, you can choose "command" (it uses your `npm test` command, but will come with a big performance penalty)',
      name: 'testRunner',
      type: 'list',
    });
    return options.filter((_) => _.name === answers.testRunner)[0] || { name: CommandTestRunner.runnerName, pkg: null };
  }

  public async promptMutator(options: PromptOption[]): Promise<PromptOption> {
    const answers = await inquirer.prompt<{ mutator: string }>({
      choices: options.map((_) => _.name),
      message: 'What kind of code do you want to mutate?',
      name: 'mutator',
      type: 'list',
    });
    return options.filter((_) => _.name === answers.mutator)[0];
  }

  public async promptReporters(options: PromptOption[]): Promise<PromptOption[]> {
    const answers = await inquirer.prompt<{ reporters: string[] }>({
      choices: options.map((_) => _.name),
      default: ['html', 'clear-text', 'progress'],
      message: 'Which reporter(s) do you want to use?',
      name: 'reporters',
      type: 'checkbox',
    });
    return options.filter((option) => answers.reporters.some((reporterName) => option.name === reporterName));
  }

  public async promptPackageManager(options: PromptOption[]): Promise<PromptOption> {
    const answers = await inquirer.prompt<{ packageManager: string }>({
      choices: options.map((_) => _.name),
      default: ['npm'],
      message: 'Which package manager do you want to use?',
      name: 'packageManager',
      type: 'list',
    });
    return options.filter((_) => _.name === answers.packageManager)[0];
  }

  public async promptJsonConfigType(): Promise<boolean> {
    const json = 'JSON';

    const answers = await inquirer.prompt<{ configType: string }>({
      choices: [json, 'JavaScript'],
      default: json,
      message: 'What file type do you want for your config file?',
      name: 'configType',
      type: 'list',
    });
    return answers.configType === json;
  }
}
