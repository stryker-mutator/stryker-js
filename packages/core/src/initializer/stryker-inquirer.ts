import inquirer from 'inquirer';

import { CommandTestRunner } from '../test-runner/command-test-runner.js';

import { ChoiceType } from './choice-type.js';
import { CustomInitializer } from './custom-initializers/custom-initializer.js';
import { PromptOption } from './prompt-option.js';

export interface PromptResult {
  additionalNpmDependencies: string[];
  additionalConfig: Record<string, unknown>;
}

export class StrykerInquirer {
  public async promptPresets(options: CustomInitializer[]): Promise<CustomInitializer | undefined> {
    const choices: ChoiceType[] = options.map((_) => _.name);
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
    if (options.length) {
      const choices: ChoiceType[] = options.map((_) => _.name);
      choices.push(new inquirer.Separator());
      choices.push(CommandTestRunner.runnerName);
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
      default: 'none',
      when: !skip,
    });

    return { name: buildCommand !== 'none' ? buildCommand : '', pkg: null };
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
    return options.find(({ name }) => name === answers.packageManager)!;
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
