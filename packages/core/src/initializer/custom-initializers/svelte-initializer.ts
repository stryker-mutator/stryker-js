import inquirer from 'inquirer';

import { CustomInitializer, CustomInitializerConfiguration } from './custom-initializer.js';

const guideUrl = 'https://stryker-mutator.io/docs/stryker-js/guides/svelte';
const reporters = Object.freeze(['progress', 'clear-text', 'html']);

export class SvelteInitializer implements CustomInitializer {
  public readonly name = 'svelte';

  public async createConfig(): Promise<CustomInitializerConfiguration> {
    const testRunnerChoices = ['jest', 'vitest'];
    const testRunnerNodeArgs: string[] = [];
    const { testRunner } = await inquirer.prompt<{ testRunner: string }>({
      choices: testRunnerChoices,
      message: 'Which test runner are you using?',
      name: 'testRunner',
      type: 'list',
    });
    if (testRunner === 'jest') {
      const { nativeEsm } = await inquirer.prompt<{ nativeEsm: boolean }>({
        type: 'confirm',
        name: 'nativeEsm',
        message: 'Are you using native EcmaScript modules? (see https://jestjs.io/docs/ecmascript-modules)',
        default: true,
      });
      if (nativeEsm) {
        testRunnerNodeArgs.push('--experimental-vm-modules');
      }
    }
    return {
      config: {
        testRunner,
        ...(testRunnerNodeArgs.length ? { testRunnerNodeArgs } : {}),
        reporters,
      },
      dependencies: [`@stryker-mutator/${testRunner}-runner`],
      guideUrl,
    };
  }
}
