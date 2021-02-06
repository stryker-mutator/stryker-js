import os from 'os';

import { MutationScoreThresholds } from '@stryker-mutator/api/core';
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

  constructor(public header: string, public valueFactory: TableCellValueFactory, public rows: MetricsResult) {
    const maxContentSize = this.determineValueSize();
    this.width = this.pad(dots(maxContentSize)).length;
  }

  protected determineValueSize(row: MetricsResult = this.rows, ancestorCount = 0): number {
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
    return `${spaces(this.width - input.length - 2)} ${input} `;
  }

  public drawLine(): string {
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
    super('% score', (row) => row.metrics.mutationScore.toFixed(2), rows);
  }
  protected color(metricsResult: MetricsResult) {
    if (metricsResult.metrics.mutationScore >= this.thresholds.high) {
      return chalk.green;
    } else if (metricsResult.metrics.mutationScore >= this.thresholds.low) {
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

  constructor(private readonly metricsResult: MetricsResult, thresholds: MutationScoreThresholds) {
    this.columns = [
      new FileColumn(metricsResult),
      new MutationScoreColumn(metricsResult, thresholds),
      new Column('# killed', (row) => row.metrics.killed.toString(), metricsResult),
      new Column('# timeout', (row) => row.metrics.timeout.toString(), metricsResult),
      new Column('# survived', (row) => row.metrics.survived.toString(), metricsResult),
      new Column('# no cov', (row) => row.metrics.noCoverage.toString(), metricsResult),
      new Column('# error', (row) => (row.metrics.runtimeErrors + row.metrics.compileErrors).toString(), metricsResult),
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
