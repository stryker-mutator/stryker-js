import * as child from 'child_process';

import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { notEmpty } from '@stryker-mutator/util';

import CommandTestRunner from '../test-runner/CommandTestRunner';

import NpmClient from './NpmClient';
import { PackageInfo } from './PackageInfo';
import Preset from './presets/Preset';
import PromptOption from './PromptOption';
import StrykerConfigWriter from './StrykerConfigWriter';
import { StrykerInquirer } from './StrykerInquirer';
import GitignoreWriter from './GitignoreWriter';

import { initializerTokens } from '.';

const enum PackageManager {
  Npm = 'npm',
  Yarn = 'yarn',
}

export default class StrykerInitializer {
  public static inject = tokens(
    commonTokens.logger,
    initializerTokens.out,
    initializerTokens.npmClient,
    initializerTokens.strykerPresets,
    initializerTokens.configWriter,
    initializerTokens.gitignoreWriter,
    initializerTokens.inquirer
  );
  constructor(
    private readonly log: Logger,
    private readonly out: typeof console.log,
    private readonly client: NpmClient,
    private readonly strykerPresets: Preset[],
    private readonly configWriter: StrykerConfigWriter,
    private readonly gitignoreWriter: GitignoreWriter,
    private readonly inquirer: StrykerInquirer
  ) {}

  /**
   * Runs the initializer will prompt the user for questions about his setup. After that, install plugins and configure Stryker.
   * @function
   */
  public async initialize(): Promise<void> {
    this.configWriter.guardForExistingConfig();
    this.patchProxies();
    const selectedPreset = await this.selectPreset();
    let configFileName: string;
    if (selectedPreset) {
      configFileName = await this.initiatePreset(this.configWriter, selectedPreset);
    } else {
      configFileName = await this.initiateCustom(this.configWriter);
    }
    await this.gitignoreWriter.addStrykerTempFolder();
    this.out(`Done configuring stryker. Please review "${configFileName}", you might need to configure transpilers or your test runner correctly.`);
    this.out("Let's kill some mutants with this command: `stryker run`");
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

  private async initiatePreset(configWriter: StrykerConfigWriter, selectedPreset: Preset) {
    const presetConfig = await selectedPreset.createConfig();
    const isJsonSelected = await this.selectJsonConfigType();
    const configFileName = await configWriter.writePreset(presetConfig, isJsonSelected);
    const selectedPackageManager = await this.selectPackageManager();
    this.installNpmDependencies(presetConfig.dependencies, selectedPackageManager);
    return configFileName;
  }

  private async initiateCustom(configWriter: StrykerConfigWriter) {
    const selectedTestRunner = await this.selectTestRunner();
    const selectedTestFramework =
      selectedTestRunner && !CommandTestRunner.is(selectedTestRunner.name) ? await this.selectTestFramework(selectedTestRunner) : null;
    const selectedMutator = await this.selectMutator();
    const selectedTranspilers = await this.selectTranspilers();
    const selectedReporters = await this.selectReporters();
    const selectedPackageManager = await this.selectPackageManager();
    const isJsonSelected = await this.selectJsonConfigType();
    const npmDependencies = this.getSelectedNpmDependencies(
      [selectedTestRunner, selectedTestFramework, selectedMutator].concat(selectedTranspilers).concat(selectedReporters)
    );
    const configFileName = await configWriter.write(
      selectedTestRunner,
      selectedTestFramework,
      selectedMutator,
      selectedTranspilers,
      selectedReporters,
      selectedPackageManager,
      await this.fetchAdditionalConfig(npmDependencies),
      isJsonSelected
    );
    this.installNpmDependencies(
      npmDependencies.map((pkg) => pkg.name),
      selectedPackageManager
    );
    return configFileName;
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

  private async selectReporters(): Promise<PromptOption[]> {
    let reporterOptions: PromptOption[];
    reporterOptions = await this.client.getTestReporterOptions();
    reporterOptions.push(
      {
        name: 'html',
        pkg: null,
      },
      {
        name: 'clear-text',
        pkg: null,
      },
      {
        name: 'progress',
        pkg: null,
      },
      {
        name: 'dashboard',
        pkg: null,
      }
    );
    return this.inquirer.promptReporters(reporterOptions);
  }

  private async selectTestFramework(testRunnerOption: PromptOption): Promise<null | PromptOption> {
    let selectedTestFramework: PromptOption | null = null;
    const testFrameworkOptions = await this.client.getTestFrameworkOptions(testRunnerOption.pkg ? testRunnerOption.pkg.name : null);
    if (testFrameworkOptions.length) {
      this.log.debug(`Found test frameworks for ${testRunnerOption.name}: ${JSON.stringify(testFrameworkOptions)}`);
      const none: PromptOption = {
        name: 'None/other',
        pkg: null,
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
      return this.inquirer.promptMutator(mutatorOptions);
    } else {
      this.out('Unable to select a mutator. You will need to configure it manually.');
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

  private async selectPackageManager(): Promise<PromptOption> {
    return this.inquirer.promptPackageManager([
      {
        name: PackageManager.Npm,
        pkg: null,
      },
      {
        name: PackageManager.Yarn,
        pkg: null,
      },
    ]);
  }

  private async selectJsonConfigType(): Promise<boolean> {
    return this.inquirer.promptJsonConfigType();
  }

  private getSelectedNpmDependencies(selectedOptions: Array<PromptOption | null>): PackageInfo[] {
    return selectedOptions
      .filter(notEmpty)
      .map((option) => option.pkg)
      .filter(notEmpty);
  }

  /**
   * Install the npm packages
   * @function
   */
  private installNpmDependencies(dependencies: string[], selectedOption: PromptOption): void {
    if (dependencies.length === 0) {
      return;
    }

    const dependencyArg = dependencies.join(' ');
    this.out('Installing NPM dependencies...');
    const cmd = selectedOption.name === PackageManager.Npm ? `npm i --save-dev ${dependencyArg}` : `yarn add ${dependencyArg} --dev`;
    this.out(cmd);
    try {
      child.execSync(cmd, { stdio: [0, 1, 2] });
    } catch (_) {
      this.out(`An error occurred during installation, please try it yourself: "${cmd}"`);
    }
  }

  private async fetchAdditionalConfig(dependencies: PackageInfo[]): Promise<Array<Record<string, unknown>>> {
    return (await Promise.all(dependencies.map((dep) => this.client.getAdditionalConfig(dep)))).filter(notEmpty);
  }
}
