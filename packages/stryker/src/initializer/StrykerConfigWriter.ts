import { fsAsPromised } from '@stryker-mutator/util';
import * as _ from 'lodash';
import { format } from 'prettier';
import { StrykerOptions } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';
import PresetConfiguration from './presets/PresetConfiguration';
import PromptOption from './PromptOption';

const STRYKER_CONFIG_FILE = 'stryker.conf.js';

export default class StrykerConfigWriter {

  private readonly log = getLogger(StrykerConfigWriter.name);
  constructor(private readonly out: (output: string) => void) {
  }

  public guardForExistingConfig() {
    if (fsAsPromised.existsSync(STRYKER_CONFIG_FILE)) {
      const msg =
        'Stryker config file "stryker.conf.js" already exists in the current directory. Please remove it and try again.';
      this.log.error(msg);
      throw new Error(msg);
    }
  }

  /**
   * Create stryker.conf.js based on the chosen framework and test runner
   */
  public write(
    selectedTestRunner: null | PromptOption,
    selectedTestFramework: null | PromptOption,
    selectedMutator: null | PromptOption,
    selectedTranspilers: null | PromptOption[],
    selectedReporters: PromptOption[],
    selectedPackageManager: PromptOption,
    additionalPiecesOfConfig: Array<Partial<StrykerOptions>>): Promise<void> {
    const configObject: Partial<StrykerOptions> = {
      mutator: selectedMutator ? selectedMutator.name : '',
      packageManager: selectedPackageManager.name,
      reporters: selectedReporters.map(rep => rep.name),
      testRunner: selectedTestRunner ? selectedTestRunner.name : '',
      transpilers: selectedTranspilers ? selectedTranspilers.map(t => t.name) : []
    };

    this.configureTestFramework(configObject, selectedTestFramework);
    _.assign(configObject, ...additionalPiecesOfConfig);

    return this.writeStrykerConfig(configObject);
  }

  /**
   * Create stryker.conf.js based on the chosen preset
   */
  public async writePreset(presetConfig: PresetConfiguration) {
    return this.writeStrykerConfigRaw(presetConfig.config, `// This config was generated using a preset.
    // Please see the handbook for more information: ${presetConfig.handbookUrl}`);
  }

  private configureTestFramework(configObject: Partial<StrykerOptions>, selectedTestFramework: null | PromptOption) {
    if (selectedTestFramework) {
      configObject.testFramework = selectedTestFramework.name;
      configObject.coverageAnalysis = 'perTest';
    } else {
      configObject.coverageAnalysis = 'all';
    }
  }

  private wrapInModule(configObject: Partial<StrykerOptions>): string {
    return JSON.stringify(configObject, null, 2);
  }

  private writeStrykerConfig(configObject: Partial<StrykerOptions>) {
    return this.writeStrykerConfigRaw(this.wrapInModule(configObject));
  }

  private writeStrykerConfigRaw(rawConfig: string, rawHeader = '') {
    this.out('Writing stryker.conf.js...');
    const formattedConf = format(`${rawHeader}
      module.exports = function(config){
        config.set(
          ${rawConfig}
        );
      }`, { parser: 'babylon' });

    return fsAsPromised.writeFile(STRYKER_CONFIG_FILE, formattedConf);
  }
}
