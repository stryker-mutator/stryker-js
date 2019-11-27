import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { childProcessAsPromised, fsAsPromised } from '@stryker-mutator/util';

import PresetConfiguration from './presets/PresetConfiguration';
import PromptOption from './PromptOption';

import { initializerTokens } from '.';

const STRYKER_CONFIG_FILE = 'stryker.conf.js';

export default class StrykerConfigWriter {
  public static inject = tokens(commonTokens.logger, initializerTokens.out);
  constructor(private readonly log: Logger, private readonly out: typeof console.log) {}

  public guardForExistingConfig() {
    if (fsAsPromised.existsSync(STRYKER_CONFIG_FILE)) {
      const msg = 'Stryker config file "stryker.conf.js" already exists in the current directory. Please remove it and try again.';
      this.log.error(msg);
      throw new Error(msg);
    }
  }

  /**
   * Create stryker.conf.js based on the chosen framework and test runner
   * @function
   */
  public write(
    selectedTestRunner: null | PromptOption,
    selectedTestFramework: null | PromptOption,
    selectedMutator: null | PromptOption,
    selectedTranspilers: null | PromptOption[],
    selectedReporters: PromptOption[],
    selectedPackageManager: PromptOption,
    selectedStatistics: PromptOption,
    additionalPiecesOfConfig: Array<Partial<StrykerOptions>>
  ): Promise<void> {
    const configObject: Partial<StrykerOptions> = {
      mutator: selectedMutator ? selectedMutator.name : '',
      packageManager: selectedPackageManager.name,
      reporters: selectedReporters.map(rep => rep.name),
      testRunner: selectedTestRunner ? selectedTestRunner.name : '',
      transpilers: selectedTranspilers ? selectedTranspilers.map(t => t.name) : [],
      collectStatistics: selectedStatistics.name
    };

    this.configureTestFramework(configObject, selectedTestFramework);
    Object.assign(configObject, ...additionalPiecesOfConfig);
    return this.writeStrykerConfig(configObject);
  }

  /**
   * Create stryker.conf.js based on the chosen preset
   * @function
   */
  public async writePreset(presetConfig: PresetConfiguration) {
    return this.writeStrykerConfigRaw(
      presetConfig.config,
      `// This config was generated using a preset.
    // Please see the handbook for more information: ${presetConfig.handbookUrl}`
    );
  }

  private configureTestFramework(configObject: Partial<StrykerOptions>, selectedTestFramework: null | PromptOption) {
    if (selectedTestFramework) {
      configObject.testFramework = selectedTestFramework.name;
      configObject.coverageAnalysis = 'perTest';
    } else {
      configObject.coverageAnalysis = 'all';
    }
  }

  private async writeStrykerConfigRaw(rawConfig: string, rawHeader = '') {
    this.out('Writing & formatting stryker.conf.js...');
    const formattedConf = `${rawHeader}
      module.exports = function(config){
        config.set(
          ${rawConfig}
        );
      }`;
    await fsAsPromised.writeFile(STRYKER_CONFIG_FILE, formattedConf);
    try {
      await childProcessAsPromised.exec(`npx prettier --write ${STRYKER_CONFIG_FILE}`);
    } catch (error) {
      this.log.debug('Prettier exited with error', error);
      this.out('Unable to format stryker.conf.js file for you. This is not a big problem, but it might look a bit messy 🙈.');
    }
  }

  private writeStrykerConfig(configObject: Partial<StrykerOptions>) {
    return this.writeStrykerConfigRaw(this.wrapInModule(configObject));
  }

  private wrapInModule(configObject: Partial<StrykerOptions>): string {
    return JSON.stringify(configObject, null, 2);
  }
}
