import * as child from 'child_process';
import * as fs from 'mz/fs';
import * as path from 'path';
import * as _ from 'lodash';
import StrykerConfigFactory from './StrykerConfigFactory';
import { StrykerInquirer } from './StrykerInquirer';
import { StrykerConfigOptions } from './StrykerConfigOptions';
import * as rm from 'typed-rest-client/RestClient';

interface NpmSearch {
    total: number;
    results: NpmPackage[];
}

interface NpmPackage {
  package: {
    name: string;
    version: string;
  };
}

export default class StrykerInitializer {

  constructor(private log = console.log) { }

  /**
   * Runs the initializer ask used framework and test runner en setup environment
   * @function
   */
  async initialize(): Promise<void> {
    await this.addAdditionalTestRunners();
    this.detectKarmaConfigFile();
    const answers = await new StrykerInquirer().prompt(StrykerConfigOptions);
    this.installNpmDependencies(answers.additionalNpmDependencies.concat(['stryker-html-reporter']));
    await this.installStrykerConfiguration(answers.additionalConfig);
    this.log('Let\'s kill some mutants with this command: `stryker run`');
  }

  async addAdditionalTestRunners() {
    let restc: rm.RestClient = new rm.RestClient('npm', 'https://api.npms.io');
    let res: rm.IRestResponse<NpmSearch> = await restc.get<NpmSearch>('/v2/search?q=stryker-runner');

    // Check if response is ok and packages return
    if (res.statusCode === 200 && res.result.results.length > 0) {
      const packages = res.result.results;

      // For every packages that is returned:
      packages.map((npmPackage) => {
        const thisPackage = npmPackage.package;

        // Check if it is not already known as testrunner
        if (StrykerConfigOptions.testRunners.filter((testRunner) => { 
          return testRunner.npm === thisPackage.name;
        }).length === 0) {
          
          // Add testrunner to config options
          const name = thisPackage.name.split('-')[1];
          StrykerConfigOptions.testRunners.push({
            name: name[0].toUpperCase() + name.substr(1),
            npm: thisPackage.name,
            config: {
              testRunner: name
            }
          });
        }
      });
    }
  }

  /**
   * Detects if there is a karm.conf.js in the root and make karma testrunner the defaults
   * @function
   */
  private detectKarmaConfigFile(): void {
    if (fs.existsSync(path.resolve(process.cwd(), 'karma.conf.js'))) {
      this.log('Found karma.conf.js');
      const karmaTestRunner = StrykerConfigOptions.testRunners.filter(testRunner => testRunner.npm === 'stryker-karma-runner')[0];
      const config: any = karmaTestRunner.config;
      config.karmaConfigFile = './karma.conf.js';
      StrykerConfigOptions.defaultTestRunner = karmaTestRunner.name;
    }
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