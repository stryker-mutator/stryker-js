import fs from 'fs/promises';

import path from 'path';

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
  TestResult,
  toMutantRunResult,
  determineHitLimitReached,
} from '@stryker-mutator/api/test-runner';

import { createVitest, Vitest } from 'vitest/node';
import { escapeRegExp } from '@stryker-mutator/util';

import { convertTestToTestResult, fromTestId, collectTestsFromSuite, addToInlineDeps } from './vitest-helpers.js';
import { FileCommunicator } from './file-communicator.js';
import { VitestRunnerOptionsWithStrykerOptions } from './vitest-runner-options-with-stryker-options.js';

type StrykerNamespace = '__stryker__' | '__stryker2__';

export class VitestTestRunner implements TestRunner {
  public static inject = [commonTokens.options, commonTokens.logger, 'globalNamespace'] as const;
  private ctx!: Vitest;
  private readonly fileCommunicator: FileCommunicator;
  private readonly options: VitestRunnerOptionsWithStrykerOptions;

  constructor(options: StrykerOptions, private readonly log: Logger, globalNamespace: StrykerNamespace) {
    this.options = options as VitestRunnerOptionsWithStrykerOptions;
    this.fileCommunicator = new FileCommunicator(globalNamespace);
  }

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: true };
  }

  public async init(): Promise<void> {
    this.ctx = await createVitest('test', {
      config: this.options.vitest?.configFile,
      threads: true,
      coverage: { enabled: false },
      singleThread: true,
      watch: false,
      onConsoleLog: () => false,
    });

    // The vitest setup file needs to be inlined
    // See https://github.com/vitest-dev/vitest/issues/3403#issuecomment-1554057966
    const vitestSetupMatcher = new RegExp(escapeRegExp(this.fileCommunicator.files.vitestSetup));
    addToInlineDeps(this.ctx.config, vitestSetupMatcher);
    this.ctx.projects.forEach((project) => {
      project.config.setupFiles = [this.fileCommunicator.files.vitestSetup, ...project.config.setupFiles];
      addToInlineDeps(project.config, vitestSetupMatcher);
    });
    if (this.log.isDebugEnabled()) {
      this.log.debug(`vitest final config: ${JSON.stringify(this.ctx.config, null, 2)}`);
    }
  }

  public async dryRun(): Promise<DryRunResult> {
    await this.fileCommunicator.setDryRun();
    const testResult = await this.run();
    const mutantCoverage: MutantCoverage = await this.readMutantCoverage();
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
    await this.fileCommunicator.setMutantRun(options);
    const dryRunResult = await this.run(options.testFilter);
    const hitCount = await this.readHitCount();
    const timeOut = determineHitLimitReached(hitCount, options.hitLimit);
    return toMutantRunResult(timeOut ?? dryRunResult);
  }

  private async run(testIds: string[] = []): Promise<DryRunResult> {
    this.resetContext();
    if (testIds.length > 0) {
      const regexTestNameFilter = testIds
        .map(fromTestId)
        .map(({ name }) => escapeRegExp(name))
        .join('|');
      const regex = new RegExp(regexTestNameFilter);
      const testFiles = testIds.map(fromTestId).map(({ file }) => file);
      this.ctx.projects.forEach((project) => {
        project.config.testNamePattern = regex;
      });
      await this.ctx.start(testFiles);
    } else {
      this.ctx.projects.forEach((project) => {
        project.config.testNamePattern = undefined;
      });
      await this.ctx.start();
    }
    const tests = this.ctx.state.getFiles().flatMap((file) => collectTestsFromSuite(file));
    const testResults: TestResult[] = tests.map((test) => convertTestToTestResult(test));
    return { tests: testResults, status: DryRunStatus.Complete };
  }

  private resetContext() {
    // Clear the state from the previous run
    // Note that this is kind of a hack, see https://github.com/vitest-dev/vitest/discussions/3017#discussioncomment-5901751
    this.ctx.state.filesMap.clear();

    // Since we:
    // 1. are reusing the same vitest instance
    // 2. have changed the vitest setup file contents (see FileCommunicator.setMutantRun)
    // 3. the vitest setup file is inlined (see VitestTestRunner.init)
    // 4. we're not using the vitest watch mode
    // We need to invalidate the module cache for the vitest setup file
    // See https://github.com/vitest-dev/vitest/issues/3409#issuecomment-1555884513
    this.ctx.projects.forEach((project) => {
      const moduleGraph = project.server.moduleGraph;
      const module = moduleGraph.getModuleById(this.fileCommunicator.files.vitestSetup);
      if (module) {
        moduleGraph.invalidateModule(module);
      }
    });
  }

  private async readHitCount() {
    const projectHitCountFiles = await fs.readdir(this.fileCommunicator.files.hitCountDir);
    const projectHitCounts = await Promise.all(
      projectHitCountFiles.map(async (hitCountFile) =>
        parseInt(await fs.readFile(path.resolve(this.fileCommunicator.files.hitCountDir, hitCountFile), 'utf-8'))
      )
    );
    return projectHitCounts.reduce((acc, hitCount) => acc + hitCount, 0);
  }

  private async readMutantCoverage(): Promise<MutantCoverage> {
    // Read coverage from all projects
    const projectCoverageFiles = await fs.readdir(this.fileCommunicator.files.coverageDir);
    const projectCoverages: MutantCoverage[] = await Promise.all(
      projectCoverageFiles.map(async (coverageFile) =>
        JSON.parse(await fs.readFile(path.resolve(this.fileCommunicator.files.coverageDir, coverageFile), 'utf-8'))
      )
    );
    if (projectCoverages.length > 1) {
      return projectCoverages.reduce((acc, projectCoverage) => {
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
    return projectCoverages[0];

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
    await this.fileCommunicator.dispose();
    await this.ctx.close();
    await this.ctx.closingPromise;
  }
}

export const vitestTestRunnerFactory = createVitestTestRunnerFactory();

export function createVitestTestRunnerFactory(
  namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE
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
