import { promises as fs } from 'fs';

import {
  PartialStrykerOptions,
  StrykerOptions,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Immutable, childProcessAsPromised } from '@stryker-mutator/util';

import { fileUtils } from '../utils/file-utils.js';
import { CommandTestRunner } from '../test-runner/command-test-runner.js';
import {
  SUPPORTED_CONFIG_FILE_NAMES,
  DEFAULT_CONFIG_FILE_NAMES,
} from '../config/index.js';

import { PromptOption } from './prompt-option.js';
import { CustomInitializerConfiguration } from './custom-initializers/custom-initializer.js';

import { initializerTokens } from './index.js';

export class StrykerConfigWriter {
  public static inject = tokens(commonTokens.logger, initializerTokens.out);
  constructor(
    private readonly log: Logger,
    private readonly out: typeof console.log,
  ) {}

  public async guardForExistingConfig(): Promise<void> {
    for (const fileName of SUPPORTED_CONFIG_FILE_NAMES) {
      await this.checkIfConfigFileExists(fileName);
    }
  }

  private async checkIfConfigFileExists(file: string) {
    if (await fileUtils.exists(file)) {
      const msg = `Stryker config file "${file}" already exists in the current directory. Please remove it and try again.`;
      this.log.error(msg);
      throw new Error(msg);
    }
  }

  /**
   * Create config based on the chosen framework and test runner
   * @function
   */
  public write(
    selectedTestRunner: PromptOption,
    buildCommand: PromptOption,
    selectedReporters: PromptOption[],
    selectedPackageManager: PromptOption,
    requiredPlugins: string[],
    additionalPiecesOfConfig: Array<Partial<StrykerOptions>>,
    homepageOfSelectedTestRunner: string,
    exportAsJson: boolean,
  ): Promise<string> {
    const configObject: Partial<StrykerOptions> & { _comment: string } = {
      _comment:
        "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
      packageManager: selectedPackageManager.name as 'npm' | 'pnpm' | 'yarn',
      reporters: selectedReporters.map((rep) => rep.name),
      testRunner: selectedTestRunner.name,
      testRunner_comment: `Take a look at ${homepageOfSelectedTestRunner} for information about the ${selectedTestRunner.name} plugin.`,
      coverageAnalysis: CommandTestRunner.is(selectedTestRunner.name)
        ? 'off'
        : 'perTest',
    };

    // Only write buildCommand to config file if non-empty
    if (buildCommand.name) {
      configObject.buildCommand = buildCommand.name;
    }

    // Automatic plugin discovery doesn't work with pnpm, so explicitly specify the required plugins in the config file
    if (selectedPackageManager.name === 'pnpm') {
      configObject.plugins = requiredPlugins;
    }

    Object.assign(configObject, ...additionalPiecesOfConfig);
    return this.writeStrykerConfig(
      configObject as Immutable<PartialStrykerOptions>,
      exportAsJson,
    );
  }

  /**
   * Create config based on the chosen preset
   * @function
   */
  public async writeCustomInitializer(
    initializerConfig: CustomInitializerConfiguration,
    exportAsJson: boolean,
  ): Promise<string> {
    const config = {
      _comment: `This config was generated using 'stryker init'. Please see the guide for more information: ${initializerConfig.guideUrl}`,
      ...initializerConfig.config,
    };

    return this.writeStrykerConfig(config, exportAsJson);
  }

  private writeStrykerConfig(
    config: Immutable<PartialStrykerOptions>,
    exportAsJson: boolean,
  ) {
    if (exportAsJson) {
      return this.writeJsonConfig(config);
    } else {
      return this.writeJsConfig(config);
    }
  }

  private async writeJsConfig(
    commentedConfig: Immutable<PartialStrykerOptions>,
  ) {
    const configFileName = DEFAULT_CONFIG_FILE_NAMES.JAVASCRIPT;
    this.out(`Writing & formatting ${configFileName} ...`);
    const rawConfig = this.stringify(commentedConfig);

    const formattedConfig = `// @ts-check
    /** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
      const config = ${rawConfig};
      export default config;`;
    await fs.writeFile(configFileName, formattedConfig);
    try {
      await childProcessAsPromised.exec(
        `npx prettier --write ${configFileName}`,
      );
    } catch (error) {
      this.log.debug('Prettier exited with error', error);
      this.out(
        `Unable to format ${configFileName} file for you. This is not a big problem, but it might look a bit messy 🙈.`,
      );
    }
    return configFileName;
  }

  private async writeJsonConfig(
    commentedConfig: Immutable<PartialStrykerOptions>,
  ) {
    const configFileName = DEFAULT_CONFIG_FILE_NAMES.JSON;
    this.out(`Writing & formatting ${configFileName}...`);
    const typedConfig = {
      $schema:
        './node_modules/@stryker-mutator/core/schema/stryker-schema.json',
      ...commentedConfig,
    };
    const formattedConfig = this.stringify(typedConfig);
    await fs.writeFile(configFileName, formattedConfig);

    return configFileName;
  }

  private stringify(input: Record<string, unknown>): string {
    return JSON.stringify(input, undefined, 2);
  }
}
