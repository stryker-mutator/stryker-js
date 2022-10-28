import os from 'os';

import { MutationScoreThresholds, StrykerOptions } from '@stryker-mutator/api/core';
import { MetricsResult } from 'mutation-testing-metrics';

import chalk from 'chalk';
import flatMap from 'lodash.flatmap';

const FILES_ROOT_NAME = 'All files';

type TableCellValueFactory = (row: MetricsResult, ancestorCount: number) => string;

const repeat = (char: string, nTimes: number) => new Array(nTimes > -1 ? nTimes + 1 : 0).join(char);
const spaces = (n: number) => repeat(' ', n);
const dots = (n: number) => repeat('.', n);

/**
 * Represents a column in the clear text table
 */
class Column {
  protected width: number;
  private readonly emojiRegex = '✅|💥|🙈|👽|⌛️';
  private readonly emojiMatchInHeader: RegExpExecArray | null;

  constructor(public header: string, public valueFactory: TableCellValueFactory, public rows: MetricsResult) {
    this.emojiMatchInHeader = RegExp(this.emojiRegex).exec(this.header);
    const maxContentSize = this.determineValueSize();
    this.width = this.pad(dots(maxContentSize)).length;
  }

  private determineValueSize(row: MetricsResult = this.rows, ancestorCount = 0): number {
    const valueWidths = row.childResults.map((child) => this.determineValueSize(child, ancestorCount + 1));
    valueWidths.push(this.header.length);
    valueWidths.push(this.valueFactory(row, ancestorCount).length);
    return Math.max(...valueWidths);
  }

  /**
   * Adds padding (spaces) to the front and end of a value
   * @param input The string input
   */
  protected pad(input: string): string {
    if (this.header.includes('✅')) {
      if (input.includes('✅')) return `${spaces(this.width - input.length - 3)} ${input} `;
      return `${spaces(this.width - input.length - 1)} ${input} `;
    }

    return `${spaces(this.width - input.length - 2)} ${input} `;
  }

  public drawLine(): string {
    if (this.header.includes('✅')) return repeat('-', this.width + 1);
    return repeat('-', this.width);
  }

  public drawTableCell(score: MetricsResult, ancestorCount: number) {
    return this.color(score)(this.pad(this.valueFactory(score, ancestorCount)));
  }

  public drawHeader() {
    return this.pad(this.header);
  }

  protected color(_score: MetricsResult) {
    return (input: string) => input;
  }
}

class MutationScoreColumn extends Column {
  constructor(rows: MetricsResult, private readonly thresholds: MutationScoreThresholds) {
    super('% score', (row) => (isNaN(row.metrics.mutationScore) ? 'n/a' : row.metrics.mutationScore.toFixed(2)), rows);
  }
  protected color(metricsResult: MetricsResult) {
    const { mutationScore: score } = metricsResult.metrics;

    if (isNaN(score)) {
      return chalk.grey;
    } else if (score >= this.thresholds.high) {
      return chalk.green;
    } else if (score >= this.thresholds.low) {
      return chalk.yellow;
    } else {
      return chalk.red;
    }
  }
}

class FileColumn extends Column {
  constructor(rows: MetricsResult) {
    super('File', (row, ancestorCount) => spaces(ancestorCount) + (ancestorCount === 0 ? FILES_ROOT_NAME : row.name), rows);
  }
  protected pad(input: string): string {
    return `${input} ${spaces(this.width - input.length - 1)}`;
  }
}

/**
 * Represents a clear text table for mutation score
 */
export class ClearTextScoreTable {
  private readonly columns: Column[];

  constructor(private readonly metricsResult: MetricsResult, options: StrykerOptions) {
    this.columns = [
      new FileColumn(metricsResult),
      new MutationScoreColumn(metricsResult, options.thresholds),
      new Column(`${options.disableConsoleEmojis ? '#' : '✅'} killed`, (row) => row.metrics.killed.toString(), metricsResult),
      new Column(`${options.disableConsoleEmojis ? '#' : '⌛️'} timeout`, (row) => row.metrics.timeout.toString(), metricsResult),
      new Column(`${options.disableConsoleEmojis ? '#' : '👽'} survived`, (row) => row.metrics.survived.toString(), metricsResult),
      new Column(`${options.disableConsoleEmojis ? '#' : '💥'} no cov`, (row) => row.metrics.noCoverage.toString(), metricsResult),
      new Column(
        `${options.disableConsoleEmojis ? '#' : '💥'} errors`,
        (row) => (row.metrics.runtimeErrors + row.metrics.compileErrors).toString(),
        metricsResult
      ),
    ];
  }

  private drawBorder() {
    return this.drawRow((column) => column.drawLine());
  }

  private drawHeader() {
    return this.drawRow((c) => c.drawHeader());
  }

  private drawRow(toDraw: (col: Column) => string) {
    return this.columns.map(toDraw).join('|') + '|';
  }

  private drawValues(current = this.metricsResult, ancestorCount = 0): string[] {
    return [this.drawRow((c) => c.drawTableCell(current, ancestorCount))].concat(
      flatMap(current.childResults, (child) => this.drawValues(child, ancestorCount + 1))
    );
  }

  /**
   * Returns a string with the score results drawn in a table.
   */
  public draw(): string {
    return [this.drawBorder(), this.drawHeader(), this.drawBorder(), this.drawValues().join(os.EOL), this.drawBorder()].join(os.EOL);
  }
}
