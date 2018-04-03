import * as child from 'child_process';
import { StrykerInquirer } from './StrykerInquirer';
import NpmClient from './NpmClient';
import PromptOption from './PromptOption';
import { getLogger } from 'log4js';
import { filterEmpty } from '../utils/objectUtils';
import StrykerConfigWriter from './StrykerConfigWriter';

export default class StrykerInitializer {

  private readonly log = getLogger(StrykerInitializer.name);
  private inquirer = new StrykerInquirer();

  constructor(private out = console.log, private client: NpmClient = new NpmClient()) { }

  /**
   * Runs the initializer will prompt the user for questions about his setup. After that, install plugins and configure Stryker.
   * @function
   */
  async initialize(): Promise<void> {
    const configWriter = new StrykerConfigWriter(this.out);
    configWriter.guardForExistingConfig();
    this.patchProxies();
    const selectedTestRunner = await this.selectTestRunner();
    const selectedTestFramework = selectedTestRunner ? await this.selectTestFramework(selectedTestRunner) : null;
    const selectedMutator = await this.selectMutator();
    const selectedTranspilers = await this.selectTranspilers();
    const selectedReporters = await this.selectReporters();
    const npmDependencies = this.getSelectedNpmDependencies(
      [selectedTestRunner, selectedTestFramework, selectedMutator]
        .concat(selectedTranspilers)
        .concat(selectedReporters)
    );
    await configWriter.write(selectedTestRunner,
      selectedTestFramework,
      selectedMutator,
      selectedTranspilers,
      selectedReporters,
      await this.fetchAdditionalConfig(npmDependencies));
    this.installNpmDependencies(npmDependencies);
    this.out('Done configuring stryker. Please review `stryker.conf.js`, you might need to configure transpilers or your test runner correctly.');
    this.out('Let\'s kill some mutants with this command: `stryker run`');
  }

  /**
  * The typed rest client works only with the specific HTTP_PROXY and HTTPS_PROXY env settings.
  * Let's make sure they are available.
  */
  private patchProxies() {
    const copyEnvVariable = (from: string, to: string) => {
      if (process.env[from] && !process.env[to]) {
        process.env[to] = process.env[from];
      }
    };
    copyEnvVariable('http_proxy', 'HTTP_PROXY');
    copyEnvVariable('https_proxy', 'HTTPS_PROXY');
  }

  private async selectTestRunner(): Promise<PromptOption | null> {
    const testRunnerOptions = await this.client.getTestRunnerOptions();
    if (testRunnerOptions.length) {
      this.log.debug(`Found test runners: ${JSON.stringify(testRunnerOptions)}`);
      return await this.inquirer.promptTestRunners(testRunnerOptions);
    } else {
      this.out('Unable to select a test runner. You will need to configure it manually.');
      return null;
    }
  }

  private async selectReporters(): Promise<PromptOption[]> {
    let reporterOptions: PromptOption[];
    reporterOptions = await this.client.getTestReporterOptions();
    reporterOptions.push({
      name: 'clear-text',
      npm: null
    }, {
        name: 'progress',
        npm: null
      }, {
        name: 'dashboard',
        npm: null
      }
    );
    return this.inquirer.promptReporters(reporterOptions);
  }

  private async selectTestFramework(testRunnerOption: PromptOption): Promise<null | PromptOption> {
    let selectedTestFramework: PromptOption | null = null;
    const testFrameworkOptions = await this.client.getTestFrameworkOptions(testRunnerOption.npm);
    if (testFrameworkOptions.length) {
      this.log.debug(`Found test frameworks for ${testRunnerOption.name}: ${JSON.stringify(testFrameworkOptions)}`);
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

  private async selectMutator(): Promise<PromptOption | null> {
    const mutatorOptions = await this.client.getMutatorOptions();
    if (mutatorOptions.length) {
      this.log.debug(`Found mutators: ${JSON.stringify(mutatorOptions)}`);
      return await this.inquirer.promptMutator(mutatorOptions);
    } else {
      this.out('Unable to select a mutator. You will need to configure it manually.');
      return null;
    }
  }

  private async selectTranspilers(): Promise<PromptOption[] | null> {
    const options = await this.client.getTranspilerOptions();
    if (options.length) {
      this.log.debug(`Found transpilers: ${JSON.stringify(options)}`);
      return await this.inquirer.promptTranspilers(options);
    } else {
      this.out('Unable to select transpilers. You will need to configure it manually, if you want to use any.');
      return null;
    }
  }

  private getSelectedNpmDependencies(selectedOptions: (PromptOption | null)[]) {
    return filterEmpty(filterEmpty(selectedOptions)
      .map(option => option.npm));
  }

  /**
  * Install the npm packages
  * @function
  */
  private installNpmDependencies(dependencies: string[]): void {
    if (dependencies.length > 0) {
      this.out('Installing NPM dependencies...');
      const cmd = `npm i --save-dev stryker-api ${dependencies.join(' ')}`;
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
      this.client.getAdditionalConfig(dep))));
  }
}
