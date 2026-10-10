import path from 'path';

import { MutantResult } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';

import { reporterUtil } from './reporter-util.js';

const DEFAULT_OUTPUT_PATH = 'reports/mutation/mutant-test-timings.json';

interface MutantTimingEntry {
  id: string;
  fileName: string;
  status: MutantResult['status'];
  duration?: number;
  testsCompleted?: number;
  executedTests: NonNullable<MutantResult['executedTests']>;
}

export class MutationTimingsReporter implements Reporter {
  public static readonly inject = tokens(commonTokens.logger);

  private readonly entries: MutantTimingEntry[] = [];
  private mainPromise: Promise<void> | undefined;

  constructor(private readonly log: Logger) {}

  public onMutantTested(result: MutantResult): void {
    if (!result.executedTests?.length) {
      return;
    }
    this.entries.push({
      id: result.id,
      fileName: result.fileName,
      status: result.status,
      duration: result.duration,
      testsCompleted: result.testsCompleted,
      executedTests: result.executedTests,
    });
  }

  public onMutationTestReportReady(): void {
    if (this.entries.length === 0) {
      this.log.debug(
        'Skipping mutation-timings report because no timing entries were captured.',
      );
      return;
    }
    const outputPath = path.normalize(
      process.env.STRYKER_MUTATION_TEST_TIMINGS_FILE ?? DEFAULT_OUTPUT_PATH,
    );
    this.log.debug(`Using relative path ${outputPath}`);
    const payload = {
      schemaVersion: '1',
      generatedAt: new Date().toISOString(),
      summary: {
        mutantsWithTimings: this.entries.length,
        executedTests: this.entries.reduce(
          (sum, entry) => sum + entry.executedTests.length,
          0,
        ),
      },
      mutants: this.entries,
    };
    this.mainPromise = reporterUtil.writeFile(
      path.resolve(outputPath),
      JSON.stringify(payload),
    );
  }

  public wrapUp(): Promise<void> | undefined {
    return this.mainPromise;
  }
}
