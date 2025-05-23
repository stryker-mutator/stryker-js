import os from 'os';

import {
  MutationScoreThresholds,
  StrykerOptions,
} from '@stryker-mutator/api/core';

import { MetricsResult } from 'mutation-testing-metrics';

import chalk from 'chalk';

import { stringWidth } from '../utils/string-utils.js';

const FILES_ROOT_NAME = 'All files';

type TableCellValueFactory = (
  row: MetricsResult,
  ancestorCount: number,
) => string;

const repeat = (char: string, nTimes: number) =>
  new Array(nTimes > -1 ? nTimes + 1 : 0).join(char);
const spaces = (n: number) => repeat(' ', n);

const determineContentWidth = (
  row: MetricsResult,
  valueFactory: TableCellValueFactory,
  ancestorCount = 0,
): number => {
  return Math.max(
    valueFactory(row, ancestorCount).length,
    ...row.childResults.map((child) =>
      determineContentWidth(child, valueFactory, ancestorCount + 1),
    ),
  );
};

/**
 * A base class for single columns and grouped columns
 */
abstract class Column {
  /**
   * @param header The title of the column
   * @param netWidth The width of the column (excl 2 spaces padding)
   * @param isFirstColumn Whether or not this is the first column in the table. If it is the first column, it should not have a space in front of it.
   */
  constructor(
    protected readonly header: string,
    public netWidth: number,
    public readonly isFirstColumn: boolean,
  ) {}

  /**
   * Adds padding (spaces) to the front and end of a value
   * @param input The string input
   */
  protected pad(input = ''): string {
    return `${spaces(this.netWidth - stringWidth(input))}${this.isFirstColumn ? '' : ' '}${input} `;
  }

  public drawLine(): string {
    return repeat('-', this.width);
  }

  public drawHeader() {
    return this.pad(this.header);
  }

  abstract drawTableCell(score: MetricsResult, ancestorCount: number): string;

  /**
   * The gross width of the column (including padding)
   */
  get width() {
    return this.netWidth + (this.isFirstColumn ? 1 : 2);
  }
}

/**
 * Represents a single column in the clear text table (no group)
 */
class SingleColumn extends Column {
  constructor(
    header: string,
    isFirstColumn: boolean,
    public valueFactory: TableCellValueFactory,
    public rows: MetricsResult,
  ) {
    const maxContentSize = determineContentWidth(rows, valueFactory);
    super(header, Math.max(maxContentSize, stringWidth(header)), isFirstColumn);
  }

  public drawTableCell(score: MetricsResult, ancestorCount: number): string {
    return this.color(score)(this.pad(this.valueFactory(score, ancestorCount)));
  }

  protected color(_score: MetricsResult) {
    return (input: string) => input;
  }
}

class MutationScoreColumn extends SingleColumn {
  constructor(
    rows: MetricsResult,
    private readonly thresholds: MutationScoreThresholds,
    private readonly scoreType: 'total' | 'covered',
  ) {
    super(
      scoreType,
      false,
      (row) => {
        const score =
          scoreType === 'total'
            ? row.metrics.mutationScore
            : row.metrics.mutationScoreBasedOnCoveredCode;
        return isNaN(score) ? 'n/a' : score.toFixed(2);
      },
      rows,
    );
  }
  protected color(metricsResult: MetricsResult) {
    const {
      mutationScore: score,
      mutationScoreBasedOnCoveredCode: coveredScore,
    } = metricsResult.metrics;
    const scoreToUse = this.scoreType === 'total' ? score : coveredScore;
    if (isNaN(scoreToUse)) {
      return chalk.grey;
    } else if (scoreToUse >= this.thresholds.high) {
      return chalk.green;
    } else if (scoreToUse >= this.thresholds.low) {
      return chalk.yellow;
    } else {
      return chalk.red;
    }
  }
}

class FileColumn extends SingleColumn {
  constructor(rows: MetricsResult) {
    super(
      'File',
      true,
      (row, ancestorCount) =>
        spaces(ancestorCount) +
        (ancestorCount === 0 ? FILES_ROOT_NAME : row.name),
      rows,
    );
  }
  protected override pad(input: string): string {
    // Align left
    return `${input}${spaces(this.width - stringWidth(input))}`;
  }
}

class GroupColumn extends Column {
  columns: SingleColumn[];
  constructor(groupName: string, ...columns: SingleColumn[]) {
    // Calculate the width of the columns, use the `width`, since the gross width is included in this grouped column. Subtract 2 for the padding.
    const { isFirstColumn } = columns[0];
    const columnsWidth =
      columns.reduce((acc, cur) => acc + cur.width, 0) -
      (isFirstColumn ? 1 : 2);
    const groupNameWidth = stringWidth(groupName);
    super(groupName, Math.max(groupNameWidth, columnsWidth), isFirstColumn);
    this.columns = columns;
    if (this.netWidth > columnsWidth + 1) {
      // Resize the first column to fill the gap
      columns[0].netWidth += this.netWidth - columnsWidth - 1;
    }
  }

  drawColumnHeaders() {
    return this.columns.map((column) => column.drawHeader()).join('|');
  }

  drawColumnLines() {
    return this.columns.map((column) => column.drawLine()).join('|');
  }

  drawTableCell(score: MetricsResult, ancestorCount: number): string {
    return this.columns
      .map((column) => column.drawTableCell(score, ancestorCount))
      .join('|');
  }
}

/**
 * Represents a clear text table for mutation score
 */
export class ClearTextScoreTable {
  private readonly columns: GroupColumn[];

  constructor(
    private readonly metricsResult: MetricsResult,
    private readonly options: StrykerOptions,
  ) {
    this.columns = [
      new GroupColumn('', new FileColumn(metricsResult)),
      new GroupColumn(
        '% Mutation score',
        new MutationScoreColumn(metricsResult, options.thresholds, 'total'),
        new MutationScoreColumn(metricsResult, options.thresholds, 'covered'),
      ),
      new GroupColumn(
        '',
        new SingleColumn(
          `${options.clearTextReporter.allowEmojis ? '✅' : '#'} killed`,
          false,
          (row) => row.metrics.killed.toString(),
          metricsResult,
        ),
      ),
      new GroupColumn(
        '',
        new SingleColumn(
          `${options.clearTextReporter.allowEmojis ? '⌛️' : '#'} timeout`,
          false,
          (row) => row.metrics.timeout.toString(),
          metricsResult,
        ),
      ),
      new GroupColumn(
        '',
        new SingleColumn(
          `${options.clearTextReporter.allowEmojis ? '👽' : '#'} survived`,
          false,
          (row) => row.metrics.survived.toString(),
          metricsResult,
        ),
      ),
      new GroupColumn(
        '',
        new SingleColumn(
          `${options.clearTextReporter.allowEmojis ? '🙈' : '#'} no cov`,
          false,
          (row) => row.metrics.noCoverage.toString(),
          metricsResult,
        ),
      ),
      new GroupColumn(
        '',
        new SingleColumn(
          `${options.clearTextReporter.allowEmojis ? '💥' : '#'} errors`,
          false,
          (row) =>
            (row.metrics.runtimeErrors + row.metrics.compileErrors).toString(),
          metricsResult,
        ),
      ),
    ];
  }

  private drawGroupHeader() {
    return this.drawRow((column) => column.drawHeader());
  }

  private drawGroupLine() {
    return this.drawRow((column) => column.drawLine());
  }
  private drawLine() {
    return this.drawRow((column) => column.drawColumnLines());
  }

  private drawColumnHeader() {
    return this.drawRow((c) => c.drawColumnHeaders());
  }

  private drawRow(toDraw: (col: GroupColumn) => string) {
    return this.columns.map(toDraw).join('|') + '|';
  }

  private drawTableBody(
    current = this.metricsResult,
    ancestorCount = 0,
  ): string[] {
    const rows: string[] = [];
    if (
      !this.options.clearTextReporter.skipFull ||
      current.metrics.mutationScore !== 100
    ) {
      rows.push(this.drawRow((c) => c.drawTableCell(current, ancestorCount)));
    }
    rows.push(
      ...current.childResults.flatMap((child) =>
        this.drawTableBody(child, ancestorCount + 1),
      ),
    );
    return rows;
  }

  /**
   * Returns a string with the score results drawn in a table.
   */
  public draw(): string {
    return [
      this.drawGroupLine(),
      this.drawGroupHeader(),
      this.drawColumnHeader(),
      this.drawLine(),
      this.drawTableBody().join(os.EOL),
      this.drawLine(),
    ].join(os.EOL);
  }
}
