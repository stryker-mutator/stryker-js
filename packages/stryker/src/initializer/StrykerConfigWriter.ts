import * as fs from 'mz/fs';
import * as _ from 'lodash';
import { getLogger } from 'log4js';
import { StrykerOptions } from 'stryker-api/core';
import PromptOption from './PromptOption';

const STRYKER_CONFIG_FILE = 'stryker.conf.js';

const log = getLogger('StrykerConfigWriter');

export default class StrykerConfigWriter {

  private configObject: Partial<StrykerOptions>;

  constructor(private out: (output: string) => void, selectedTestRunner: null | PromptOption, private selectedTestFramework: null | PromptOption, selectedReporters: PromptOption[], private additionalPiecesOfConfig: Partial<StrykerOptions>[]) {
    this.configObject = {
      files: [
        { pattern: 'src/**/*.js', mutated: true, included: false },
        'test/**/*.js'
      ],
      testRunner: (selectedTestRunner ? selectedTestRunner.name : ''),
      reporter: selectedReporters.map(rep => rep.name)
    };
  }

  static guardForExistingConfig() {
    if (fs.existsSync(STRYKER_CONFIG_FILE)) {
      const msg = 'Stryker config file "stryker.conf.js" already exists in the current directory. Please remove it and try again.';
      log.error(msg);
      throw new Error(msg);
    }
  }


  /**
  * Create stryker.conf.js based on the chosen framework and test runner
  * @function
  */
  public async write(): Promise<void> {
    this.configureTestFramework();
    _.assign(this.configObject, ...this.additionalPiecesOfConfig);
    return this.writeStrykerConfig(this.configObject);
  }


  private configureTestFramework() {
    if (this.selectedTestFramework) {
      this.configObject.testFramework = this.selectedTestFramework.name;
      this.configObject.coverageAnalysis = 'perTest';
    } else {
      this.configObject.coverageAnalysis = 'all';
    }
  }

  private writeStrykerConfig(configObject: Partial<StrykerOptions>) {
    this.out('Writing stryker.conf.js...');
    return fs.writeFile(STRYKER_CONFIG_FILE, this.wrapInModule());
  }

  private wrapInModule() {
    return `
  module.exports = function(config){
    config.set(
      ${JSON.stringify(this.configObject, null, 2)}
    );
  }`;
  }
}