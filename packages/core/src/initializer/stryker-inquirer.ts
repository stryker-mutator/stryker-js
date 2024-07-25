import inquirer from 'inquirer';

import { CommandTestRunner } from '../test-runner/command-test-runner.js';

import { CustomInitializer } from './custom-initializers/custom-initializer.js';
import { PromptOption } from './prompt-option.js';
import { ListChoices } from './types.js';

export interface PromptResult {
  additionalNpmDependencies: string[];
  additionalConfig: Record<string, unknown>;
}

export class StrykerInquirer {
  public async promptPresets(options: CustomInitializer[]): Promise<CustomInitializer | undefined> {
    const choices: ListChoices = [
      ...options.map(({ name }) => ({
        value: name,
      })),
      new inquirer.Separator(),
      { value: 'None/other' },
    ];
    const answers = await inquirer.prompt<{ preset: string }>({
      choices,
      message: 'Are you using one of these frameworks? Then select a preset configuration.',
      name: 'preset',
      type: 'select',
    });
    return options.find((_) => _.name === answers.preset);
  }

  public async promptTestRunners(options: PromptOption[]): Promise<PromptOption> {
    if (options.length) {
      const choices: ListChoices = [
        ...options.map(({ name }) => ({ value: name })),
        new inquirer.Separator(),
        { value: CommandTestRunner.runnerName },
      ];
      const answers = await inquirer.prompt<{ testRunner: string }>({
        choices,
        message:
          'Which test runner do you want to use? If your test runner isn\'t listed here, you can choose "command" (it uses your `npm test` command, but will come with a big performance penalty)',
        name: 'testRunner',
        type: 'list',
      });
      return options.find(({ name }) => name === answers.testRunner) ?? { name: CommandTestRunner.runnerName, pkg: null };
    } else {
      return { name: CommandTestRunner.runnerName, pkg: null };
    }
  }

  public async promptBuildCommand(skip: boolean): Promise<PromptOption> {
    const { buildCommand } = await inquirer.prompt<{ buildCommand: string }>({
      message:
        'What build command should be executed just before running your tests? For example: "npm run build" or "tsc -b" (leave empty when this is not needed).',
      name: 'buildCommand',
      type: 'input',
      default: 'none',
      when: !skip,
    });

    return { name: buildCommand !== 'none' ? buildCommand : '', pkg: null };
  }

  public async promptReporters(options: PromptOption[]): Promise<PromptOption[]> {
    const defaults = ['html', 'clear-text', 'progress'];
    const answers = await inquirer.prompt<{ reporters: string[] }>({
      choices: options.map(({ name }) => ({ value: name, checked: defaults.includes(name) })),
      message: 'Which reporter(s) do you want to use?',
      name: 'reporters',
      type: 'checkbox',
    });
    return options.filter((option) => answers.reporters.some((reporterName) => option.name === reporterName));
  }

  public async promptPackageManager(options: PromptOption[]): Promise<PromptOption> {
    const answers = await inquirer.prompt<{ packageManager: string }>({
      choices: options.map((_) => ({ value: _.name })),
      default: ['npm'],
      message: 'Which package manager do you want to use?',
      name: 'packageManager',
      type: 'list',
    });
    return options.find(({ name }) => name === answers.packageManager)!;
  }

  public async promptJsonConfigType(): Promise<boolean> {
    const json = 'JSON';

    const answers = await inquirer.prompt<{ configType: string }>({
      choices: [{ value: json }, { value: 'JavaScript' }],
      default: json,
      message: 'What file type do you want for your config file?',
      name: 'configType',
      type: 'list',
    });
    return answers.configType === json;
  }
}
