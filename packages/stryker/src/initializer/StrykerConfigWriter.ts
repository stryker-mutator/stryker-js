import * as _ from 'lodash';
import { fsAsPromised } from '@stryker-mutator/util';
import { getLogger } from 'stryker-api/logging';
import { StrykerOptions } from 'stryker-api/core';
import PromptOption from './PromptOption';
import { format } from 'prettier';

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
   * @function
   */
  public write(
    selectedTestRunner: null | PromptOption,
    selectedTestFramework: null | PromptOption,
    selectedMutator: null | PromptOption,
    selectedTranspilers: null | PromptOption[],
    selectedReporters: PromptOption[],
    selectedPackageManager: PromptOption,
    additionalPiecesOfConfig: Partial<StrykerOptions>[]): Promise<void> {
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

  private configureTestFramework(configObject: Partial<StrykerOptions>, selectedTestFramework: null | PromptOption) {
    if (selectedTestFramework) {
      configObject.testFramework = selectedTestFramework.name;
      configObject.coverageAnalysis = 'perTest';
    } else {
      configObject.coverageAnalysis = 'all';
    }
  }

  private writeStrykerConfig(configObject: Partial<StrykerOptions>) {
    this.out('Writing stryker.conf.js...');
    return fsAsPromised.writeFile(STRYKER_CONFIG_FILE, this.wrapInModule(configObject));
  }

  private wrapInModule(configObject: Partial<StrykerOptions>) {
    return format(`
      module.exports = function(config){
        config.set(
          ${JSON.stringify(configObject, null, 2)}
        );
      }`, { parser: 'babylon' });
  }
}
