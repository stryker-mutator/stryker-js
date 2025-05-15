import os from 'os';

import chalk, { Color } from 'chalk';
import { schema, Position, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import {
  MetricsResult,
  MutantModel,
  TestModel,
  MutationTestMetricsResult,
  TestFileModel,
  TestMetrics,
  TestStatus,
} from 'mutation-testing-metrics';
import { tokens } from 'typed-inject';

import { getEmojiForStatus, plural } from '../utils/string-utils.js';

import { ClearTextScoreTable } from './clear-text-score-table.js';

export class ClearTextReporter implements Reporter {
  public static inject = tokens(commonTokens.logger, commonTokens.options);
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
  ) {
    this.configConsoleColor();
  }

  private readonly out: NodeJS.WritableStream = process.stdout;

  private readonly writeLine = (output?: string) => {
    this.out.write(`${output ?? ''}${os.EOL}`);
  };

  private readonly writeDebugLine = (input: string) => {
    this.log.debug(input);
  };

  private configConsoleColor() {
    if (!this.options.allowConsoleColors) {
      chalk.level = 0; // All colors disabled
    }
  }

  public onMutationTestReportReady(
    _report: schema.MutationTestResult,
    metrics: MutationTestMetricsResult,
  ): void {
    this.writeLine();

    if (this.options.clearTextReporter.reportTests) {
      this.reportTests(metrics);
    }
    if (this.options.clearTextReporter.reportMutants) {
      this.reportMutants(metrics);
    }
    if (
      this.options.clearTextReporter.reportScoreTable &&
      (!this.options.clearTextReporter.skipFull ||
        metrics.systemUnderTestMetrics.childResults.some(
          (x) => x.metrics.mutationScore !== 100,
        ))
    ) {
      this.writeLine(
        new ClearTextScoreTable(
          metrics.systemUnderTestMetrics,
          this.options,
        ).draw(),
      );
    }
  }

  private reportTests(metrics: MutationTestMetricsResult) {
    function indent(depth: number) {
      return new Array(depth).fill('  ').join('');
    }
    const formatTestLine = (test: TestModel, state: string): string => {
      return `${this.color('grey', `${test.name}${test.location ? ` [line ${test.location.start.line}]` : ''}`)} (${state})`;
    };

    if (metrics.testMetrics) {
      const reportTests = (
        currentResult: MetricsResult<TestFileModel, TestMetrics>,
        depth = 0,
      ) => {
        const nameParts: string[] = [currentResult.name];
        while (!currentResult.file && currentResult.childResults.length === 1) {
          [currentResult] = currentResult.childResults;
          nameParts.push(currentResult.name);
        }
        this.writeLine(`${indent(depth)}${nameParts.join('/')}`);
        currentResult.file?.tests.forEach((test) => {
          switch (test.status) {
            case TestStatus.Killing:
              this.writeLine(
                `${indent(depth + 1)}${this.color('greenBright', '✓')} ${formatTestLine(test, `killed ${test.killedMutants?.length}`)}`,
              );
              break;
            case TestStatus.Covering:
              this.writeLine(
                `${indent(depth + 1)}${this.color('blueBright', '~')} ${formatTestLine(test, `covered ${test.coveredMutants?.length}`)}`,
              );
              break;
            case TestStatus.NotCovering:
              this.writeLine(
                `${indent(depth + 1)}${this.color('redBright', '✘')} ${formatTestLine(test, 'covered 0')}`,
              );
              break;
          }
        });
        currentResult.childResults.forEach((childResult) =>
          reportTests(childResult, depth + 1),
        );
      };
      reportTests(metrics.testMetrics);
    }
  }

  private reportMutants({
    systemUnderTestMetrics,
  }: MutationTestMetricsResult): void {
    this.writeLine();
    let totalTests = 0;

    const reportMutants = (metrics: MetricsResult[]) => {
      metrics.forEach((child) => {
        child.file?.mutants.forEach((result) => {
          totalTests += result.testsCompleted ?? 0;
          switch (result.status) {
            case 'Killed':
            case 'Timeout':
            case 'RuntimeError':
            case 'CompileError':
              this.reportMutantResult(result, this.writeDebugLine);
              break;
            case 'Survived':
            case 'NoCoverage':
              this.reportMutantResult(result, this.writeLine);
              break;
            default:
          }
        });
        reportMutants(child.childResults);
      });
    };
    reportMutants(systemUnderTestMetrics.childResults);
    this.writeLine(
      `Ran ${(totalTests / systemUnderTestMetrics.metrics.totalMutants).toFixed(2)} tests per mutant on average.`,
    );
  }

  private statusLabel(mutant: MutantModel): string {
    const { status } = mutant;
    return this.options.clearTextReporter.allowEmojis
      ? `${getEmojiForStatus(status)} ${status}`
      : status.toString();
  }

  private reportMutantResult(
    result: MutantModel,
    logImplementation: (input: string) => void,
  ): void {
    logImplementation(`[${this.statusLabel(result)}] ${result.mutatorName}`);
    logImplementation(
      this.colorSourceFileAndLocation(result.fileName, result.location.start),
    );

    result
      .getOriginalLines()
      .split('\n')
      .filter(Boolean)
      .forEach((line) => {
        logImplementation(chalk.red('-   ' + line));
      });
    result
      .getMutatedLines()
      .split('\n')
      .filter(Boolean)
      .forEach((line) => {
        logImplementation(chalk.green('+   ' + line));
      });
    if (result.status === 'Survived') {
      if (result.static) {
        logImplementation('Ran all tests for this mutant.');
      } else if (result.coveredByTests) {
        this.logExecutedTests(result.coveredByTests, logImplementation);
      }
    } else if (result.status === 'Killed' && result.killedByTests?.length) {
      logImplementation(`Killed by: ${result.killedByTests[0].name}`);
    } else if (
      result.status === 'RuntimeError' ||
      result.status === 'CompileError'
    ) {
      logImplementation(`Error message: ${result.statusReason}`);
    }
    logImplementation('');
  }

  private colorSourceFileAndLocation(
    fileName: string,
    position: Position,
  ): string {
    return [
      this.color('cyan', fileName),
      this.color('yellow', position.line),
      this.color('yellow', position.column),
    ].join(':');
  }

  private color(color: Color, ...text: unknown[]) {
    if (this.options.clearTextReporter.allowColor) {
      return chalk[color](...text);
    }
    return text.join('');
  }

  private logExecutedTests(
    tests: TestModel[],
    logImplementation: (input: string) => void,
  ) {
    if (!this.options.clearTextReporter.logTests) {
      return;
    }

    const testCount = Math.min(
      this.options.clearTextReporter.maxTestsToLog,
      tests.length,
    );

    if (testCount > 0) {
      logImplementation('Tests ran:');
      tests.slice(0, testCount).forEach((test) => {
        logImplementation(`    ${test.name}`);
      });
      const diff = tests.length - this.options.clearTextReporter.maxTestsToLog;
      if (diff > 0) {
        logImplementation(`  and ${diff} more test${plural(diff)}!`);
      }
      logImplementation('');
    }
  }
}
