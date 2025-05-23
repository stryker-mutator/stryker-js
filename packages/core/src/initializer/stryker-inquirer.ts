import { CommandTestRunner } from '../test-runner/command-test-runner.js';

import { CustomInitializer } from './custom-initializers/custom-initializer.js';
import { PromptOption } from './prompt-option.js';
import { inquire } from './inquire.js';

export interface PromptResult {
  additionalNpmDependencies: string[];
  additionalConfig: Record<string, unknown>;
}

export class StrykerInquirer {
  public async promptPresets(
    options: CustomInitializer[],
  ): Promise<CustomInitializer | undefined> {
    const preset = await inquire.select({
      choices: [
        ...options.map(({ name }) => ({
          value: name,
        })),
        inquire.separator(),
        { value: 'None/other' },
      ],
      message:
        'Are you using one of these frameworks? Then select a preset configuration.',
    });
    return options.find((_) => _.name === preset);
  }

  public async promptTestRunners(
    options: PromptOption[],
  ): Promise<PromptOption> {
    if (options.length) {
      const testRunner = await inquire.select({
        choices: [
          ...options.map(({ name }) => ({ value: name })),
          inquire.separator(),
          { value: CommandTestRunner.runnerName },
        ],
        message:
          'Which test runner do you want to use? If your test runner isn\'t listed here, you can choose "command" (it uses your `npm test` command, but will come with a big performance penalty)',
      });
      return (
        options.find(({ name }) => name === testRunner) ?? {
          name: CommandTestRunner.runnerName,
          pkg: null,
        }
      );
    } else {
      return { name: CommandTestRunner.runnerName, pkg: null };
    }
  }

  public async promptBuildCommand(): Promise<PromptOption> {
    const buildCommand = await inquire.input({
      message:
        'What build command should be executed just before running your tests? For example: "npm run build" or "tsc -b" (leave empty when this is not needed).',
      default: 'none',
    });

    return { name: buildCommand !== 'none' ? buildCommand : '', pkg: null };
  }

  public async promptReporters(
    options: PromptOption[],
  ): Promise<PromptOption[]> {
    const defaults = ['html', 'clear-text', 'progress'];
    const reporters = await inquire.checkbox({
      choices: options.map(({ name }) => ({
        value: name,
        checked: defaults.includes(name),
      })),
      message: 'Which reporter(s) do you want to use?',
    });
    return options.filter((option) =>
      reporters.some((reporterName) => option.name === reporterName),
    );
  }

  public async promptPackageManager(
    options: PromptOption[],
  ): Promise<PromptOption> {
    const packageManager = await inquire.select({
      choices: options.map((_) => ({ value: _.name })),
      default: 'npm',
      message: 'Which package manager do you want to use?',
    });
    return options.find(({ name }) => name === packageManager)!;
  }

  public async promptJsonConfigFormat(): Promise<boolean> {
    const json = 'JSON';

    const configFormat = await inquire.select({
      choices: [{ value: json }, { value: 'JavaScript' }],
      default: json,
      message: 'What file type do you want for your config file?',
    });
    return configFormat === json;
  }
}
