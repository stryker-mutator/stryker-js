import path from 'path';

import {
  StrykerOptions,
  MutantTestCoverage,
  MutantResult,
  schema,
  MutantStatus,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import {
  I,
  normalizeFileName,
  normalizeWhitespaces,
  type requireResolve,
} from '@stryker-mutator/util';
import {
  calculateMutationTestMetrics,
  MutationTestMetricsResult,
} from 'mutation-testing-metrics';
import {
  MutantRunResult,
  MutantRunStatus,
  TestResult,
} from '@stryker-mutator/api/test-runner';
import {
  CheckStatus,
  PassedCheckResult,
  CheckResult,
} from '@stryker-mutator/api/check';

import { strykerVersion } from '../stryker-package.js';
import { coreTokens } from '../di/index.js';
import { objectUtils } from '../utils/object-utils.js';
import { Project, FileSystem } from '../fs/index.js';
import { TestCoverage } from '../mutants/index.js';

const STRYKER_FRAMEWORK: Readonly<
  Pick<schema.FrameworkInformation, 'branding' | 'name' | 'version'>
> = Object.freeze({
  name: 'StrykerJS',
  version: strykerVersion,
  branding: {
    homepageUrl: 'https://stryker-mutator.io',
    imageUrl:
      "data:image/svg+xml;utf8,%3Csvg viewBox='0 0 1458 1458' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd' stroke-linejoin='round' stroke-miterlimit='2'%3E%3Cpath fill='none' d='M0 0h1458v1458H0z'/%3E%3CclipPath id='a'%3E%3Cpath d='M0 0h1458v1458H0z'/%3E%3C/clipPath%3E%3Cg clip-path='url(%23a)'%3E%3Cpath d='M1458 729c0 402.655-326.345 729-729 729S0 1131.655 0 729C0 326.445 326.345 0 729 0s729 326.345 729 729' fill='%23e74c3c' fill-rule='nonzero'/%3E%3Cpath d='M778.349 1456.15L576.6 1254.401l233-105 85-78.668v-64.332l-257-257-44-187-50-208 251.806-82.793L1076.6 389.401l380.14 379.15c-19.681 367.728-311.914 663.049-678.391 687.599z' fill-opacity='.3'/%3E%3Cpath d='M753.4 329.503c41.79 0 74.579 7.83 97.925 25.444 23.571 18.015 41.69 43.956 55.167 77.097l11.662 28.679 165.733-58.183-14.137-32.13c-26.688-60.655-64.896-108.61-114.191-144.011-49.329-35.423-117.458-54.302-204.859-54.302-50.78 0-95.646 7.376-134.767 21.542-40.093 14.671-74.09 34.79-102.239 60.259-28.84 26.207-50.646 57.06-65.496 92.701-14.718 35.052-22.101 72.538-22.101 112.401 0 72.536 20.667 133.294 61.165 182.704 38.624 47.255 98.346 88.037 179.861 121.291 42.257 17.475 78.715 33.125 109.227 46.994 27.193 12.361 49.294 26.124 66.157 41.751 15.309 14.186 26.497 30.584 33.63 49.258 7.721 20.214 11.16 45.69 11.16 76.402 0 28.021-4.251 51.787-13.591 71.219-8.832 18.374-20.171 33.178-34.523 44.219-14.787 11.374-31.193 19.591-49.393 24.466-19.68 5.359-39.14 7.993-58.69 7.993-29.359 0-54.387-3.407-75.182-10.747-20.112-7.013-37.144-16.144-51.259-27.486-13.618-11.009-24.971-23.766-33.744-38.279-9.64-15.8-17.272-31.924-23.032-48.408l-10.965-31.376-161.669 60.585 10.734 30.124c10.191 28.601 24.197 56.228 42.059 82.748 18.208 27.144 41.322 51.369 69.525 72.745 27.695 21.075 60.904 38.218 99.481 51.041 37.777 12.664 82.004 19.159 132.552 19.159 49.998 0 95.818-8.321 137.611-24.622 42.228-16.471 78.436-38.992 108.835-67.291 30.719-28.597 54.631-62.103 71.834-100.642 17.263-38.56 25.923-79.392 25.923-122.248 0-54.339-8.368-100.37-24.208-138.32-16.29-38.759-38.252-71.661-65.948-98.797-26.965-26.418-58.269-48.835-93.858-67.175-33.655-17.241-69.196-33.11-106.593-47.533-35.934-13.429-65.822-26.601-89.948-39.525-22.153-11.868-40.009-24.21-53.547-37.309-11.429-11.13-19.83-23.678-24.718-37.664-5.413-15.49-7.98-33.423-7.98-53.577 0-40.883 11.293-71.522 37.086-90.539 28.443-20.825 64.985-30.658 109.311-30.658z' fill='%23f1c40f' fill-rule='nonzero'/%3E%3Cpath d='M720 0h18v113h-18zM1458 738v-18h-113v18h113zM720 1345h18v113h-18zM113 738v-18H0v18h113z'/%3E%3C/g%3E%3C/svg%3E",
  },
});

/**
 * A helper class to convert and report mutants that survived or get killed
 */
export class MutationTestReportHelper {
  public static inject = tokens(
    coreTokens.reporter,
    commonTokens.options,
    coreTokens.project,
    commonTokens.logger,
    coreTokens.testCoverage,
    coreTokens.fs,
    coreTokens.requireFromCwd,
  );

  constructor(
    private readonly reporter: Required<Reporter>,
    private readonly options: StrykerOptions,
    private readonly project: Project,
    private readonly log: Logger,
    private readonly testCoverage: I<TestCoverage>,
    private readonly fs: I<FileSystem>,
    private readonly requireFromCwd: typeof requireResolve,
  ) {}

  public reportCheckFailed(
    mutant: MutantTestCoverage,
    checkResult: Exclude<CheckResult, PassedCheckResult>,
  ): MutantResult {
    const location = objectUtils.toSchemaLocation(mutant.location);
    return this.reportOne({
      ...mutant,
      status: this.checkStatusToResultStatus(checkResult.status),
      statusReason: checkResult.reason,
      location,
    });
  }

  public reportMutantStatus(
    mutant: MutantTestCoverage,
    status: MutantStatus,
  ): MutantResult {
    const location = objectUtils.toSchemaLocation(mutant.location);
    return this.reportOne({
      ...mutant,
      status,
      location,
    });
  }

  public reportMutantRunResult(
    mutant: MutantTestCoverage,
    result: MutantRunResult,
  ): MutantResult {
    const location = objectUtils.toSchemaLocation(mutant.location);

    // Prune fields used for Stryker bookkeeping
    switch (result.status) {
      case MutantRunStatus.Error:
        return this.reportOne({
          ...mutant,
          status: 'RuntimeError',
          statusReason: result.errorMessage,
          location,
        });
      case MutantRunStatus.Killed:
        return this.reportOne({
          ...mutant,
          status: 'Killed',
          testsCompleted: result.nrOfTests,
          killedBy: result.killedBy,
          statusReason: result.failureMessage,
          location,
        });
      case MutantRunStatus.Timeout:
        return this.reportOne({
          ...mutant,
          status: 'Timeout',
          statusReason: result.reason,
          location,
        });
      case MutantRunStatus.Survived:
        return this.reportOne({
          ...mutant,
          status: 'Survived',
          testsCompleted: result.nrOfTests,
          location,
        });
    }
  }

  private reportOne(result: MutantResult): MutantResult {
    this.reporter.onMutantTested(result);
    return result;
  }

  private checkStatusToResultStatus(
    status: Exclude<CheckStatus, CheckStatus.Passed>,
  ): MutantStatus {
    switch (status) {
      case CheckStatus.CompileError:
        return 'CompileError';
    }
  }

  public async reportAll(results: MutantResult[]): Promise<void> {
    const report = await this.mutationTestReport(results);
    const metrics = calculateMutationTestMetrics(report);
    this.reporter.onMutationTestReportReady(report, metrics);
    if (this.options.incremental) {
      await this.fs.mkdir(path.dirname(this.options.incrementalFile), {
        recursive: true,
      });
      await this.fs.writeFile(
        this.options.incrementalFile,
        JSON.stringify(report, null, 2),
        'utf-8',
      );
    }
    this.determineExitCode(metrics);
  }

  private determineExitCode(metrics: MutationTestMetricsResult) {
    const { mutationScore } = metrics.systemUnderTestMetrics.metrics;
    const breaking = this.options.thresholds.break;
    const formattedScore = mutationScore.toFixed(2);
    if (typeof breaking === 'number') {
      if (mutationScore < breaking) {
        this.log.error(
          `Final mutation score ${formattedScore} under breaking threshold ${breaking}, setting exit code to 1 (failure).`,
        );
        this.log.info(
          '(improve mutation score or set `thresholds.break = null` to prevent this error in the future)',
        );
        objectUtils.setExitCode(1);
      } else {
        this.log.info(
          `Final mutation score of ${formattedScore} is greater than or equal to break threshold ${breaking}`,
        );
      }
    } else {
      this.log.debug(
        "No breaking threshold configured. Won't fail the build no matter how low your mutation score is. Set `thresholds.break` to change this behavior.",
      );
    }
  }

  private async mutationTestReport(
    results: readonly MutantResult[],
  ): Promise<schema.MutationTestResult> {
    // Mocha, jest and karma use test titles as test ids.
    // This can mean a lot of duplicate strings in the json report.
    // Therefore we remap the test ids here to numbers.
    const testIdMap = new Map(
      [...this.testCoverage.testsById.values()].map((test, index) => [
        test.id,
        index.toString(),
      ]),
    );
    const remapTestId = (id: string): string => testIdMap.get(id) ?? id;
    const remapTestIds = (ids: string[] | undefined): string[] | undefined =>
      ids?.map(remapTestId);

    return {
      files: await this.toFileResults(results, remapTestIds),
      schemaVersion: '1.0',
      thresholds: this.options.thresholds,
      testFiles: await this.toTestFiles(remapTestId),
      projectRoot: process.cwd(),
      config: this.options,
      framework: {
        ...STRYKER_FRAMEWORK,
        dependencies: this.discoverDependencies(),
      },
    };
  }

  private async toFileResults(
    results: readonly MutantResult[],
    remapTestIds: (ids: string[] | undefined) => string[] | undefined,
  ): Promise<schema.FileResultDictionary> {
    const fileResultsByName = new Map<string, schema.FileResult>(
      await Promise.all(
        [...new Set(results.map(({ fileName }) => fileName))].map(
          async (fileName) =>
            [fileName, await this.toFileResult(fileName)] as const,
        ),
      ),
    );

    return results.reduce<schema.FileResultDictionary>((acc, mutantResult) => {
      const reportFileName = normalizeReportFileName(mutantResult.fileName);
      const fileResult =
        acc[reportFileName] ??
        (acc[reportFileName] = fileResultsByName.get(mutantResult.fileName)!);
      fileResult.mutants.push(this.toMutantResult(mutantResult, remapTestIds));
      return acc;
    }, {});
  }

  private async toTestFiles(
    remapTestId: (id: string) => string,
  ): Promise<schema.TestFileDefinitionDictionary> {
    const testFilesByName = new Map<string, schema.TestFile>(
      await Promise.all(
        [
          ...new Set(
            [...this.testCoverage.testsById.values()].map(
              ({ fileName }) => fileName,
            ),
          ),
        ].map(
          async (fileName) =>
            [
              normalizeReportFileName(fileName),
              await this.toTestFile(fileName),
            ] as const,
        ),
      ),
    );

    return [
      ...this.testCoverage.testsById.values(),
    ].reduce<schema.TestFileDefinitionDictionary>((acc, testResult) => {
      const test = this.toTestDefinition(testResult, remapTestId);
      const reportFileName = normalizeReportFileName(testResult.fileName);
      const testFile =
        acc[reportFileName] ??
        (acc[reportFileName] = testFilesByName.get(reportFileName)!);
      testFile.tests.push(test);
      return acc;
    }, {});
  }

  private async toFileResult(fileName: string): Promise<schema.FileResult> {
    const fileResult: schema.FileResult = {
      language: this.determineLanguage(fileName),
      mutants: [],
      source: '',
    };
    const sourceFile = this.project.files.get(fileName);
    if (sourceFile) {
      fileResult.source = await sourceFile.readOriginal();
    } else {
      this.log.warn(
        normalizeWhitespaces(`File "${fileName}" not found
    in input files, but did receive mutant result for it. This shouldn't happen`),
      );
    }
    return fileResult;
  }

  private async toTestFile(
    fileName: string | undefined,
  ): Promise<schema.TestFile> {
    const testFile: schema.TestFile = { tests: [] };
    if (fileName) {
      const file = this.project.files.get(fileName);
      if (file) {
        testFile.source = await file.readOriginal();
      } else {
        this.log.warn(
          normalizeWhitespaces(`Test file "${fileName}" not found
        in input files, but did receive test result for it. This shouldn't happen.`),
        );
      }
    }
    return testFile;
  }

  private toTestDefinition(
    test: TestResult,
    remapTestId: (id: string) => string,
  ): schema.TestDefinition {
    return {
      id: remapTestId(test.id),
      name: test.name,
      location: test.startPosition
        ? { start: objectUtils.toSchemaPosition(test.startPosition) }
        : undefined,
    };
  }

  private determineLanguage(name: string): string {
    const ext = path.extname(name).toLowerCase();
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'typescript';
      case '.html':
      case '.vue':
        return 'html';
      default:
        return 'javascript';
    }
  }

  private toMutantResult(
    mutantResult: MutantResult,
    remapTestIds: (ids: string[] | undefined) => string[] | undefined,
  ): schema.MutantResult {
    const { fileName, location, killedBy, coveredBy, ...apiMutant } =
      mutantResult;
    return {
      ...apiMutant,
      killedBy: remapTestIds(killedBy),
      coveredBy: remapTestIds(coveredBy),
      location,
    };
  }

  private discoverDependencies(): schema.Dependencies {
    const discover = (specifier: string) => {
      try {
        return [
          specifier,
          (
            this.requireFromCwd(`${specifier}/package.json`) as {
              version: string;
            }
          ).version,
        ];
      } catch {
        // package does not exist...
        return undefined;
      }
    };
    const dependencies = [
      '@stryker-mutator/mocha-runner',
      '@stryker-mutator/karma-runner',
      '@stryker-mutator/jasmine-runner',
      '@stryker-mutator/jest-runner',
      '@stryker-mutator/typescript-checker',
      'karma',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-mocha',
      'mocha',
      'jasmine',
      'jasmine-core',
      'jest',
      'react-scripts',
      'typescript',
      '@angular/cli',
      'webpack',
      'webpack-cli',
      'ts-jest',
    ];
    return dependencies
      .map(discover)
      .reduce<schema.Dependencies>((acc, dependency) => {
        if (dependency) {
          acc[dependency[0]] = dependency[1];
        }
        return acc;
      }, {});
  }
}

export function normalizeReportFileName(fileName: string | undefined) {
  if (fileName) {
    return normalizeFileName(path.relative(process.cwd(), fileName));
  }
  // File name is not required for test files. By default we accumulate tests under the '' key
  return '';
}
