import { inquire } from '../inquire.js';
import {
  CustomInitializer,
  CustomInitializerConfiguration,
} from './custom-initializer.js';

const guideUrl = 'https://stryker-mutator.io/docs/stryker-js/guides/svelte';
const reporters = Object.freeze(['progress', 'clear-text', 'html']);

export class SvelteInitializer implements CustomInitializer {
  public readonly name = 'svelte';

  public async createConfig(): Promise<CustomInitializerConfiguration> {
    const testRunnerChoices = [{ value: 'jest' }, { value: 'vitest' }];
    const testRunnerNodeArgs: string[] = [];
    const testRunner = await inquire.select({
      message: 'Which test runner are you using?',
      choices: testRunnerChoices,
    });
    if (testRunner === 'jest') {
      const nativeEsm = await inquire.confirm({
        message:
          'Are you using native EcmaScript modules? (see https://jestjs.io/docs/ecmascript-modules)',
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
