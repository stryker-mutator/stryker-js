import childProcess from 'child_process';
import { promises as fsPromises } from 'fs';

import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { notEmpty } from '@stryker-mutator/util';

import { NpmClient } from './npm-client.js';
import { PackageInfo, PackageSummary } from './package-info.js';
import { CustomInitializer } from './custom-initializers/custom-initializer.js';
import { PromptOption } from './prompt-option.js';
import { StrykerConfigWriter } from './stryker-config-writer.js';
import { StrykerInquirer } from './stryker-inquirer.js';
import { GitignoreWriter } from './gitignore-writer.js';

import { initializerTokens } from './index.js';

const enum PackageManager {
  Npm = 'npm',
  Yarn = 'yarn',
  Pnpm = 'pnpm',
}

export class StrykerInitializer {
  public static inject = tokens(
    commonTokens.logger,
    initializerTokens.out,
    initializerTokens.npmClient,
    initializerTokens.customInitializers,
    initializerTokens.configWriter,
    initializerTokens.gitignoreWriter,
    initializerTokens.inquirer,
  );
  constructor(
    private readonly log: Logger,
    private readonly out: typeof console.log,
    private readonly client: NpmClient,
    private readonly customInitializers: CustomInitializer[],
    private readonly configWriter: StrykerConfigWriter,
    private readonly gitignoreWriter: GitignoreWriter,
    private readonly inquirer: StrykerInquirer,
  ) {}

  /**
   * Runs the initializer will prompt the user for questions about his setup. After that, install plugins and configure Stryker.
   * @function
   */
  public async initialize(): Promise<void> {
    await this.configWriter.guardForExistingConfig();
    this.patchProxies();
    const selectedPreset = await this.selectCustomInitializer();
    let configFileName: string;
    if (selectedPreset) {
      configFileName = await this.initiateInitializer(
        this.configWriter,
        selectedPreset,
      );
    } else {
      configFileName = await this.initiateCustom(this.configWriter);
    }
    await this.gitignoreWriter.addStrykerTempFolder();
    this.out(
      `Done configuring stryker. Please review "${configFileName}", you might need to configure your test runner correctly.`,
    );
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

  private async selectCustomInitializer(): Promise<
    CustomInitializer | undefined
  > {
    const customInitializer: CustomInitializer[] = this.customInitializers;
    if (customInitializer.length) {
      this.log.debug(`Found presets: ${JSON.stringify(customInitializer)}`);
      return this.inquirer.promptPresets(customInitializer);
    } else {
      this.log.debug(
        'No presets have been configured, reverting to custom configuration',
      );
      return undefined;
    }
  }

  private async initiateInitializer(
    configWriter: StrykerConfigWriter,
    selectedPreset: CustomInitializer,
  ) {
    const presetConfig = await selectedPreset.createConfig();
    const isJsonSelected = await this.selectJsonConfigType();
    const configFileName = await configWriter.writeCustomInitializer(
      presetConfig,
      isJsonSelected,
    );
    if (presetConfig.additionalConfigFiles) {
      await Promise.all(
        Object.entries(presetConfig.additionalConfigFiles).map(
          ([name, content]) => fsPromises.writeFile(name, content),
        ),
      );
    }
    const selectedPackageManager = await this.selectPackageManager();
    this.installNpmDependencies(
      this.ensureCoreDependencyIncluded(presetConfig.dependencies),
      selectedPackageManager,
    );
    return configFileName;
  }

  private async initiateCustom(configWriter: StrykerConfigWriter) {
    const selectedTestRunner = await this.selectTestRunner();
    const buildCommand = await this.getBuildCommand(selectedTestRunner);
    const selectedReporters = await this.selectReporters();
    const selectedPackageManager = await this.selectPackageManager();
    const isJsonSelected = await this.selectJsonConfigType();
    const npmDependencies = this.getSelectedNpmDependencies(
      [selectedTestRunner].concat(selectedReporters),
    );
    const packageInfo = await this.fetchAdditionalConfig(npmDependencies);
    const pkgInfoOfSelectedTestRunner = packageInfo.find(
      (pkg) => pkg.name == selectedTestRunner.pkg?.name,
    );
    const additionalConfig = packageInfo
      .map((dep) => dep.initStrykerConfig ?? {})
      .filter(notEmpty);

    const configFileName = await configWriter.write(
      selectedTestRunner,
      buildCommand,
      selectedReporters,
      selectedPackageManager,
      npmDependencies.map((pkg) => pkg.name),
      additionalConfig,
      pkgInfoOfSelectedTestRunner?.homepage ??
        "(missing 'homepage' URL in package.json)",
      isJsonSelected,
    );
    this.installNpmDependencies(
      this.ensureCoreDependencyIncluded(npmDependencies.map((pkg) => pkg.name)),
      selectedPackageManager,
    );
    return configFileName;
  }

  private async selectTestRunner(): Promise<PromptOption> {
    const testRunnerOptions = await this.client.getTestRunnerOptions();
    this.log.debug(`Found test runners: ${JSON.stringify(testRunnerOptions)}`);
    return this.inquirer.promptTestRunners(testRunnerOptions);
  }

  private async getBuildCommand(
    selectedTestRunner: PromptOption,
  ): Promise<PromptOption> {
    if (selectedTestRunner.name !== 'jest') {
      return this.inquirer.promptBuildCommand();
    }
    return { name: '', pkg: null };
  }

  private async selectReporters(): Promise<PromptOption[]> {
    const reporterOptions = await this.client.getTestReporterOptions();
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
      },
    );
    return this.inquirer.promptReporters(reporterOptions);
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
      {
        name: PackageManager.Pnpm,
        pkg: null,
      },
    ]);
  }

  private async selectJsonConfigType(): Promise<boolean> {
    return this.inquirer.promptJsonConfigFormat();
  }

  private getSelectedNpmDependencies(
    selectedOptions: Array<PromptOption | null>,
  ): PackageInfo[] {
    return selectedOptions
      .filter(notEmpty)
      .map((option) => option.pkg)
      .filter(notEmpty);
  }

  /**
   * Install the npm packages
   * @function
   */
  private installNpmDependencies(
    dependencies: string[],
    selectedOption: PromptOption,
  ): void {
    if (dependencies.length === 0) {
      return;
    }

    const dependencyArg = dependencies.join(' ');
    this.out('Installing NPM dependencies...');
    const cmd = this.getInstallCommand(
      selectedOption.name as PackageManager,
      dependencyArg,
    );
    this.out(cmd);
    try {
      childProcess.execSync(cmd, { stdio: [0, 1, 2] });
    } catch {
      this.out(
        `An error occurred during installation, please try it yourself: "${cmd}"`,
      );
    }
  }

  private getInstallCommand(
    packageManager: PackageManager,
    dependencyArg: string,
  ): string {
    switch (packageManager) {
      case PackageManager.Yarn:
        return `yarn add ${dependencyArg} --dev`;
      case PackageManager.Pnpm:
        return `pnpm add -D ${dependencyArg}`;
      case PackageManager.Npm:
        return `npm i --save-dev ${dependencyArg}`;
    }
  }

  private async fetchAdditionalConfig(
    dependencies: PackageSummary[],
  ): Promise<PackageInfo[]> {
    return await Promise.all(
      dependencies.map((dep) => this.client.getAdditionalConfig(dep)),
    );
  }

  private ensureCoreDependencyIncluded(dependencies: string[]) {
    return Array.from(new Set(['@stryker-mutator/core', ...dependencies]));
  }
}
