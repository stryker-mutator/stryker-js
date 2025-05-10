import { CoverageData, INSTRUMENTER_CONSTANTS, MutantCoverage, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
import {
  TestRunner,
  DryRunResult,
  MutantRunOptions,
  MutantRunResult,
  TestRunnerCapabilities,
  DryRunStatus,
  toMutantRunResult,
  determineHitLimitReached,
  TestStatus,
} from '@stryker-mutator/api/test-runner';
import { escapeRegExp, notEmpty } from '@stryker-mutator/util';

import { vitestWrapper, Vitest } from './vitest-wrapper.js';
import { convertTestToTestResult, fromTestId, collectTestsFromSuite, normalizeCoverage } from './vitest-helpers.js';
import { VitestRunnerOptionsWithStrykerOptions } from './vitest-runner-options-with-stryker-options.js';
import { fileURLToPath } from 'url';

type StrykerNamespace = '__stryker__' | '__stryker2__';
const STRYKER_SETUP = fileURLToPath(new URL('./stryker-setup.js', import.meta.url));

export class VitestTestRunner implements TestRunner {
  public static inject = [commonTokens.options, commonTokens.logger, 'globalNamespace'] as const;
  private ctx?: Vitest;
  // private readonly fileCommunicator: FileCommunicator;
  private readonly options: VitestRunnerOptionsWithStrykerOptions;

  constructor(
    options: StrykerOptions,
    private readonly log: Logger,
    private globalNamespace: StrykerNamespace,
  ) {
    this.options = options as VitestRunnerOptionsWithStrykerOptions;
    // this.fileCommunicator = new FileCommunicator(globalNamespace);
  }

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: true };
  }

  public async init(): Promise<void> {
    this.setEnv();
    this.ctx = await vitestWrapper.createVitest('test', {
      config: this.options.vitest?.configFile,
      // @ts-expect-error threads got renamed to "pool: threads" in vitest 1.0.0
      threads: true,
      pool: 'threads',
      coverage: { enabled: false },
      poolOptions: {
        // Since vitest 1.0.0
        threads: {
          maxThreads: 1,
          minThreads: 1,
        },
      },
      singleThread: false,
      maxConcurrency: 1,
      watch: false,
      dir: this.options.vitest.dir,
      bail: this.options.disableBail ? 0 : 1,
      onConsoleLog: () => false,
    });
    this.ctx.provide('globalNamespace', this.globalNamespace);
    this.ctx.config.browser.screenshotFailures = false;
    this.ctx.projects.forEach((project) => {
      project.config.setupFiles = [STRYKER_SETUP, ...project.config.setupFiles];
      project.config.browser.screenshotFailures = false;
    });
    if (this.log.isDebugEnabled()) {
      this.log.debug(`vitest final config: ${JSON.stringify(this.ctx.config, null, 2)}`);
    }
  }

  public async dryRun(): Promise<DryRunResult> {
    this.ctx!.provide('mode', 'dry-run');

    const testResult = await this.run();
    const mutantCoverage = this.readMutantCoverage();
    if (testResult.status === DryRunStatus.Complete) {
      return {
        status: testResult.status,
        tests: testResult.tests,
        mutantCoverage,
      };
    }
    return testResult;
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    this.ctx!.provide('mode', 'mutant');
    this.ctx!.provide('hitLimit', options.hitLimit);
    this.ctx!.provide('mutantActivation', options.mutantActivation);
    this.ctx!.provide('activeMutant', options.activeMutant.id);
    const dryRunResult = await this.run(options.testFilter);
    const hitCount = this.readHitCount();
    const timeOut = determineHitLimitReached(hitCount, options.hitLimit);
    return toMutantRunResult(timeOut ?? dryRunResult);
  }

  private async run(testIds: string[] = []): Promise<DryRunResult> {
    this.resetContext();
    if (testIds.length > 0) {
      const regexTestNameFilter = testIds
        .map(fromTestId)
        .map(({ test: name }) => escapeRegExp(name))
        .join('|');
      const regex = new RegExp(regexTestNameFilter);
      const testFiles = testIds.map(fromTestId).map(({ file }) => file);
      this.ctx!.projects.forEach((project) => {
        project.config.testNamePattern = regex;
      });
      await this.ctx!.start(testFiles);
    } else {
      this.ctx!.projects.forEach((project) => {
        project.config.testNamePattern = undefined;
      });
      await this.ctx!.start();
    }
    const tests = this.ctx!.state.getFiles()
      .flatMap((file) => collectTestsFromSuite(file))
      .filter((test) => test.result); // if no result: it was skipped because of bail
    let failure = false;
    const testResults = tests.map((test) => {
      const testResult = convertTestToTestResult(test);
      failure ||= testResult.status === TestStatus.Failed;
      return testResult;
    });
    if (!failure && this.ctx!.state.errorsSet.size > 0) {
      const errorText = [...this.ctx!.state.errorsSet].map((val) => JSON.stringify(val)).join('\n');
      return {
        status: DryRunStatus.Error,
        errorMessage: `An error occurred outside of a test run, please be sure to properly await your promises! ${errorText}`,
      };
    }
    return { tests: testResults, status: DryRunStatus.Complete };
  }

  private setEnv() {
    // Set node environment for issues like these: https://github.com/stryker-mutator/stryker-js/issues/4289
    process.env.NODE_ENV = 'test';
    // Set vitest environment to signal that we are running in vitest
    // as some plugins only initiate when this is set: https://github.com/testing-library/svelte-testing-library/blob/6096f05e805cf55474f52f303562f4013785d25f/src/vite.js#L20
    process.env.VITEST = '1';
  }

  private resetContext() {
    // Clear the state from the previous run
    // Note that this is kind of a hack, see https://github.com/vitest-dev/vitest/discussions/3017#discussioncomment-5901751
    this.ctx!.state.filesMap.clear();
  }

  private readHitCount() {
    const hitCounters: number[] = this.ctx!.state.getFiles()
      .map((file) => (file.meta as { hitCount?: number }).hitCount)
      .filter(notEmpty);

    return hitCounters.reduce((acc, hitCount) => acc + hitCount, 0);
  }

  private readMutantCoverage(): MutantCoverage {
    // Read coverage from all projects
    const coverages: MutantCoverage[] = [
      ...new Map(this.ctx!.state.getFiles().map((file) => [`${file.projectName}-${file.name}`, file] as const)).entries(),
    ]
      .map(([, file]) => (file.meta as { mutantCoverage?: MutantCoverage }).mutantCoverage)
      .filter(notEmpty)
      .map(normalizeCoverage);

    if (coverages.length > 1) {
      return coverages.reduce((acc, projectCoverage) => {
        // perTest contains the coverage per test id
        Object.entries(projectCoverage.perTest).forEach(([testId, testCoverage]) => {
          if (testId in acc.perTest) {
            // Keys are mutant ids, the numbers are the amount of times it was hit.
            mergeCoverage(acc.perTest[testId], testCoverage);
          } else {
            acc.perTest[testId] = testCoverage;
          }
        });
        mergeCoverage(acc.static, projectCoverage.static);
        return acc;
      });
    }
    return coverages[0];

    function mergeCoverage(to: CoverageData, from: CoverageData) {
      Object.entries(from).forEach(([mutantId, hitCount]) => {
        if (mutantId in to) {
          to[mutantId] += hitCount;
        } else {
          to[mutantId] = hitCount;
        }
      });
    }
  }

  public async dispose(): Promise<void> {
    // await this.fileCommunicator.dispose();
    await this.ctx?.close();
  }
}

export const vitestTestRunnerFactory = createVitestTestRunnerFactory();

export function createVitestTestRunnerFactory(
  namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE,
): {
  (injector: Injector<PluginContext>): VitestTestRunner;
  inject: ['$injector'];
} {
  createVitestTestRunner.inject = tokens(commonTokens.injector);
  function createVitestTestRunner(injector: Injector<PluginContext>) {
    return injector.provideValue('globalNamespace', namespace).injectClass(VitestTestRunner);
  }
  return createVitestTestRunner;
}
