import * as child from 'child_process';
import * as fs from 'mz/fs';
import * as _ from 'lodash';
import StrykerConfigFactory from './StrykerConfigFactory';
import { StrykerInquirer } from './StrykerInquirer';

export default class StrykerInitializer {

  constructor(private log = console.log) { }

  /**
   * Runs the initializer ask used framework and test runner en setup environment
   * @function
   */
  async initialize(): Promise<void> {
    const answers = await new StrykerInquirer().prompt();
    this.installNpmDependencies(answers.additionalNpmDependencies.concat(['stryker-html-reporter']));
    await this.installStrykerConfiguration(answers.additionalConfig);
    this.log('Let\'s kill some mutants with this command: `stryker run`');
  }

  /**
  * Install the npm packages
  * @function
  */
  private installNpmDependencies(dependencies: string[]): void {
    if (dependencies.length > 0) {
      this.log('Installing NPM dependencies...');
      const cmd = `npm i --save-dev ${dependencies.join(' ')}`;
      try {
        child.execSync(cmd, { stdio: [0, 1, 2] });
      } catch (_) {
        this.log(`An error occurred during installation, please try it yourself: "${cmd}"`);
      }
    }
  }

  /**
  * Create stryker.conf.js based on the chosen framework and test runner
  * @function
  */
  private installStrykerConfiguration(configurationObject: object): Promise<void> {
    this.log('Writing stryker.conf.js...');
    const strykerConfig = _.assign(StrykerConfigFactory.default(), configurationObject);
    const newConfiguration = wrapInModule(JSON.stringify(strykerConfig, null, 2));
    return fs.writeFile('stryker.conf.js', newConfiguration);
  }
}

function wrapInModule(configParameters: string) {
  return `
  module.exports = function(config){
    config.set(
      ${configParameters}
    );
  }`;
}