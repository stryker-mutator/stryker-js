import * as child from 'child_process';
import { getLogger } from 'stryker-api/logging';
import CommandTestRunner from '../test-runner/CommandTestRunner';
import { filterEmpty } from '../utils/objectUtils';
import NpmClient from './NpmClient';
import Preset from './presets/Preset';
import PromptOption from './PromptOption';
import StrykerConfigWriter from './StrykerConfigWriter';
import { StrykerInquirer } from './StrykerInquirer';
import StrykerPresets from './StrykerPresets';

const enum PackageManager {
  Npm = 'npm',
  Yarn = 'yarn'
}

export default class StrykerInitializer {
  private readonly inquirer = new StrykerInquirer();

  private readonly log = getLogger(StrykerInitializer.name);

  constructor(private readonly out = console.log, private readonly client: NpmClient = new NpmClient(), private readonly strykerPresets: Preset[] = StrykerPresets) { }

  /**
   * Runs the initializer will prompt the user for questions about his setup. After that, install plugins and configure Stryker.
   */
  public async initialize(): Promise<void> {
    const configWriter = new StrykerConfigWriter(this.out);
    configWriter.guardForExistingConfig();
    this.patchProxies();
    const selectedPreset = await this.selectPreset();
    if (selectedPreset) {
      await this.initiatePreset(configWriter, selectedPreset);
    } else {
      await this.initiateCustom(configWriter);
    }
    this.out('Done configuring stryker. Please review `stryker.conf.js`, you might need to configure transpilers or your test runner correctly.');
    this.out('Let\'s kill some mutants with this command: `stryker run`');
  }

  private async fetchAdditionalConfig(dependencies: string[]): Promise<object[]> {
    return filterEmpty(await Promise.all(dependencies.map(dep =>
      this.client.getAdditionalConfig(dep))));
  }

  private getSelectedNpmDependencies(selectedOptions: Array<PromptOption | null>) {
    return filterEmpty(filterEmpty(selectedOptions)
      .map(option => option.npm));
  }

  private async initiateCustom(configWriter: StrykerConfigWriter) {
    const selectedTestRunner = await this.selectTestRunner();
    const selectedTestFramework = selectedTestRunner && !CommandTestRunner.is(selectedTestRunner.name)
      ? await this.selectTestFramework(selectedTestRunner) : null;
    const selectedMutator = await this.selectMutator();
    const selectedTranspilers = await this.selectTranspilers();
    const selectedReporters = await this.selectReporters();
    const selectedPackageManager = await this.selectPackageManager();
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
      selectedPackageManager,
      await this.fetchAdditionalConfig(npmDependencies));
    this.installNpmDependencies(npmDependencies, selectedPackageManager);
  }

  private async initiatePreset(configWriter: StrykerConfigWriter, selectedPreset: Preset) {
    const presetConfig = await selectedPreset.createConfig();
    await configWriter.writePreset(presetConfig);
    const selectedPackageManager = await this.selectPackageManager();
    this.installNpmDependencies(presetConfig.dependencies, selectedPackageManager);
  }

  /**
   * Install the npm packages
   */
  private installNpmDependencies(dependencies: string[], selectedOption: PromptOption): void {
    if (dependencies.length === 0) {
      return;
    }

    this.out('Installing NPM dependencies...');
    const cmd = selectedOption.name === PackageManager.Npm
      ? `npm i --save-dev stryker-api ${dependencies.join(' ')}`
      : `yarn add stryker-api ${dependencies.join(' ')} --dev`;
    this.out(cmd);
    try {
      child.execSync(cmd, { stdio: [0, 1, 2] });
    } catch (_) {
      this.out(`An error occurred during installation, please try it yourself: "${cmd}"`);
    }
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

  private async selectMutator(): Promise<PromptOption | null> {
    const mutatorOptions = await this.client.getMutatorOptions();
    if (mutatorOptions.length) {
      this.log.debug(`Found mutators: ${JSON.stringify(mutatorOptions)}`);

      return this.inquirer.promptMutator(mutatorOptions);
    } else {
      this.out('Unable to select a mutator. You will need to configure it manually.');

      return null;
    }
  }

  private async selectPackageManager(): Promise<PromptOption> {
    return this.inquirer.promptPackageManager([
      {
        name: PackageManager.Npm,
        npm: null
      },
      {
        name: PackageManager.Yarn,
        npm: null
      }
    ]);
  }

  private async selectPreset(): Promise<Preset | undefined> {
    const presetOptions: Preset[] = this.strykerPresets;
    if (presetOptions.length) {
      this.log.debug(`Found presets: ${JSON.stringify(presetOptions)}`);

      return this.inquirer.promptPresets(presetOptions);
    } else {
      this.log.debug('No presets have been configured, reverting to custom configuration');

      return undefined;
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

  private async selectTestRunner(): Promise<PromptOption | null> {
    const testRunnerOptions = await this.client.getTestRunnerOptions();
    if (testRunnerOptions.length) {
      this.log.debug(`Found test runners: ${JSON.stringify(testRunnerOptions)}`);

      return this.inquirer.promptTestRunners(testRunnerOptions);
    } else {
      this.out('Unable to select a test runner. You will need to configure it manually.');

      return null;
    }
  }

  private async selectTranspilers(): Promise<PromptOption[] | null> {
    const options = await this.client.getTranspilerOptions();
    if (options.length) {
      this.log.debug(`Found transpilers: ${JSON.stringify(options)}`);

      return this.inquirer.promptTranspilers(options);
    } else {
      this.out('Unable to select transpilers. You will need to configure it manually, if you want to use any.');

      return null;
    }
  }
}
