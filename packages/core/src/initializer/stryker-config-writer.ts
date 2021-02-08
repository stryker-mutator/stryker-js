import { existsSync, promises as fs } from 'fs';

import { PartialStrykerOptions, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { childProcessAsPromised } from '@stryker-mutator/util';

import { CommandTestRunner } from '../test-runner/command-test-runner';

import { PresetConfiguration } from './presets/preset-configuration';
import { PromptOption } from './prompt-option';

import { initializerTokens } from '.';

const STRYKER_JS_CONFIG_FILE = 'stryker.conf.js';
const STRYKER_JSON_CONFIG_FILE = 'stryker.conf.json';

export class StrykerConfigWriter {
  public static inject = tokens(commonTokens.logger, initializerTokens.out);
  constructor(private readonly log: Logger, private readonly out: typeof console.log) {}

  public guardForExistingConfig(): void {
    this.checkIfConfigFileExists(STRYKER_JS_CONFIG_FILE);
    this.checkIfConfigFileExists(STRYKER_JSON_CONFIG_FILE);
  }

  private checkIfConfigFileExists(file: string) {
    if (existsSync(file)) {
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
    selectedReporters: PromptOption[],
    selectedPackageManager: PromptOption,
    additionalPiecesOfConfig: Array<Partial<StrykerOptions>>,
    exportAsJson: boolean
  ): Promise<string> {
    const configObject: Partial<StrykerOptions> = {
      packageManager: selectedPackageManager.name as 'npm' | 'yarn',
      reporters: selectedReporters.map((rep) => rep.name),
      testRunner: selectedTestRunner.name,
      coverageAnalysis: CommandTestRunner.is(selectedTestRunner.name) ? 'off' : 'perTest',
    };

    Object.assign(configObject, ...additionalPiecesOfConfig);
    return this.writeStrykerConfig(configObject, exportAsJson);
  }

  /**
   * Create config based on the chosen preset
   * @function
   */
  public async writePreset(presetConfig: PresetConfiguration, exportAsJson: boolean): Promise<string> {
    const config = {
      _comment: `This config was generated using 'stryker init'. Please see the guide for more information: ${presetConfig.guideUrl}`,
      ...presetConfig.config,
    };

    return this.writeStrykerConfig(config, exportAsJson);
  }

  private writeStrykerConfig(config: PartialStrykerOptions, exportAsJson: boolean) {
    if (exportAsJson) {
      return this.writeJsonConfig(config);
    } else {
      return this.writeJsConfig(config);
    }
  }

  private async writeJsConfig(commentedConfig: PartialStrykerOptions) {
    this.out(`Writing & formatting ${STRYKER_JS_CONFIG_FILE}...`);
    const rawConfig = this.stringify(commentedConfig);
    const formattedConfig = `/**
      * @type {import('@stryker-mutator/api/core').StrykerOptions}
      */
      module.exports = ${rawConfig};`;
    await fs.writeFile(STRYKER_JS_CONFIG_FILE, formattedConfig);
    try {
      await childProcessAsPromised.exec(`npx prettier --write ${STRYKER_JS_CONFIG_FILE}`);
    } catch (error) {
      this.log.debug('Prettier exited with error', error);
      this.out('Unable to format stryker.conf.js file for you. This is not a big problem, but it might look a bit messy 🙈.');
    }

    return STRYKER_JS_CONFIG_FILE;
  }

  private async writeJsonConfig(commentedConfig: PartialStrykerOptions) {
    this.out(`Writing & formatting ${STRYKER_JSON_CONFIG_FILE}...`);
    const typedConfig = {
      $schema: './node_modules/@stryker-mutator/core/schema/stryker-schema.json',
      ...commentedConfig,
    };
    const formattedConfig = this.stringify(typedConfig);
    await fs.writeFile(STRYKER_JSON_CONFIG_FILE, formattedConfig);

    return STRYKER_JSON_CONFIG_FILE;
  }

  private stringify(input: Record<string, unknown>): string {
    return JSON.stringify(input, undefined, 2);
  }
}
