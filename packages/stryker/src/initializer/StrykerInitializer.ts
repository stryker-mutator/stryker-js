import * as child from 'child_process';
import { StrykerInquirer } from './StrykerInquirer';
import NpmClient from './NpmClient';
import PromptOption from './PromptOption';
import * as log4js from 'log4js';
import { filterEmpty } from '../utils/objectUtils';
import StrykerConfigWriter from './StrykerConfigWriter';

const log = log4js.getLogger('StrykerInitializer');

export default class StrykerInitializer {

  private inquirer = new StrykerInquirer();

  constructor(private out = console.log, private client: NpmClient = new NpmClient()) { }

  /**
   * Runs the initializer ask used framework and test runner en setup environment
   * @function
   */
  async initialize(): Promise<void> {
    StrykerConfigWriter.guardForExistingConfig();
    this.patchProxies();
    const selectedTestRunner = await this.selectTestRunner();
    const selectedTestFramework = selectedTestRunner ? await this.selectTestFramework(selectedTestRunner) : null;
    const selectedReporters = await this.selectReporters();
    const npmDependencies = this.getSelectedNpmDependencies(selectedTestRunner, selectedTestFramework, selectedReporters);
    this.installNpmDependencies(npmDependencies);
    await new StrykerConfigWriter(this.out,
      selectedTestRunner,
      selectedTestFramework,
      selectedReporters,
      await this.fetchAdditionalConfig(npmDependencies)).write();
    this.out('Done configuring stryker. Please review `stryker.conf.js`, you might need to configure your files and test runner correctly.');
    this.out('Let\'s kill some mutants with this command: `stryker run`');
  }

  /**
  * The typed rest client works only with the specific HTTP_PROXY and HTTPS_PROXY env settings.
  * Let's make sure they are available.
  */
  private patchProxies() {
    const copy = (from: string, to: string) => {
      if (process.env[from] && !process.env[to]) {
        process.env[to] = process.env[from];
      }
    };
    copy('http_proxy', 'HTTP_PROXY');
    copy('https_proxy', 'HTTPS_PROXY');
  }

  private async selectTestRunner(): Promise<PromptOption | null> {
    const testRunnerOptions = await this.client.getTestRunnerOptions();
    if (testRunnerOptions.length) {
      const testRunnerOptions = await this.client.getTestRunnerOptions();
      log.debug(`Found test runners: ${JSON.stringify(testRunnerOptions)}`);
      return await this.inquirer.promptTestRunners(testRunnerOptions);
    } else {
      this.out('Unable to select a test runner. You will need to configure it manually.');
      return null;
    }
  }

  private async selectReporters(): Promise<PromptOption[]> {
    let reporterOptions: PromptOption[];
    try {
      reporterOptions = await this.client.getTestReporterOptions();
    } catch (err) {
      this.out('Unable to fetch additional reporters.');
      reporterOptions = [];
    }
    reporterOptions.push({
      name: 'clear-text',
      npm: null
    }, {
        name: 'progress',
        npm: null
      });
    return this.inquirer.promptReporters(reporterOptions);
  }

  private async selectTestFramework(testRunnerOption: PromptOption): Promise<null | PromptOption> {
    let selectedTestFramework: PromptOption | null = null;
    const testFrameworkOptions = await this.client.getTestFrameworkOptions(testRunnerOption.npm);
    if (testFrameworkOptions.length) {
      log.debug(`Found test frameworks for ${testRunnerOption.name}: ${JSON.stringify(testFrameworkOptions)}`);
      const none = {
        name: 'None/other',
        npm: null
      };
      testFrameworkOptions.push(none);
      selectedTestFramework = await this.inquirer.promptTestFrameworks(testFrameworkOptions);
      if (selectedTestFramework === none) {
        selectedTestFramework = null;
        this.out('OK, downgrading coverageAnalysis to "all"');
      }
    } else {
      this.out(`No stryker test framework plugin found that is compatible with ${testRunnerOption.name}, downgrading coverageAnalysis to "all"`);
    }
    return selectedTestFramework;
  }

  private getSelectedNpmDependencies(testRunner: PromptOption | null, testFramework: PromptOption | null, reporters: PromptOption[]) {
    return filterEmpty([testRunner && testRunner.npm]
      .concat(reporters.map(rep => rep.npm))
      .concat(filterEmpty([testFramework && testFramework.npm])));
  }

  /**
  * Install the npm packages
  * @function
  */
  private installNpmDependencies(dependencies: string[]): void {
    if (dependencies.length > 0) {
      this.out('Installing NPM dependencies...');
      const cmd = `npm i --save-dev stryker stryker-api ${dependencies.join(' ')}`;
      this.out(cmd);
      try {
        child.execSync(cmd, { stdio: [0, 1, 2] });
      } catch (_) {
        this.out(`An error occurred during installation, please try it yourself: "${cmd}"`);
      }
    }
  }

  private async fetchAdditionalConfig(dependencies: string[]): Promise<object[]> {
    return filterEmpty(await Promise.all(dependencies.map(dep =>
      this.client.getAdditionalConfig(dep)
        .catch(err => {
          log.warn(`Could not fetch additional initialization config for dependency ${dep}. You might need to configure it manually`, err);
        }))));
  }
}
