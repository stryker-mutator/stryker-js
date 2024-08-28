import os from 'os';

import { MutationScoreThresholds, StrykerOptions } from '@stryker-mutator/api/core';

import { MetricsResult } from 'mutation-testing-metrics';

import chalk from 'chalk';

import emojiRegex from 'emoji-regex';

import { stringWidth } from '../utils/string-utils.js';

const FILES_ROOT_NAME = 'All files';

const emojiRe = emojiRegex();

type TableCellValueFactory = (row: MetricsResult, ancestorCount: number) => string;

const repeat = (char: string, nTimes: number) => new Array(nTimes > -1 ? nTimes + 1 : 0).join(char);
const spaces = (n: number) => repeat(' ', n);
const dots = (n: number) => repeat('.', n);

/**
 * Represents a column in the clear text table
 */
class Column {
  public width: number;
  private readonly emojiMatchInHeader: RegExpExecArray | null;
  public group?: string;

  constructor(
    public header: string,
    public valueFactory: TableCellValueFactory,
    public rows: MetricsResult,
    group?: string,
  ) {
    this.emojiMatchInHeader = emojiRe.exec(this.header);
    const maxContentSize = this.determineValueSize();
    this.width = this.pad(dots(maxContentSize)).length;
    this.group = group;
  }

  private determineValueSize(row: MetricsResult = this.rows, ancestorCount = 0): number {
    const valueWidths = row.childResults.map((child) => this.determineValueSize(child, ancestorCount + 1));
    valueWidths.push(this.headerLength);
    valueWidths.push(this.valueFactory(row, ancestorCount).length);
    return Math.max(...valueWidths);
  }

  private get headerLength() {
    return stringWidth(this.header);
  }

  /**
   * Adds padding (spaces) to the front and end of a value
   * @param input The string input
   */
  protected pad(input: string): string {
    return `${spaces(this.width - stringWidth(input) - 2)} ${input} `;
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
  constructor(
    rows: MetricsResult,
    private readonly thresholds: MutationScoreThresholds,
    private readonly scoreType: 'total' | 'covered',
    group?: string,
  ) {
    super(
      scoreType,
      (row) => {
        const score = scoreType === 'total' ? row.metrics.mutationScore : row.metrics.mutationScoreBasedOnCoveredCode;
        return isNaN(score) ? 'n/a' : score.toFixed(2);
      },
      rows,
      group,
    );
  }
  protected color(metricsResult: MetricsResult) {
    const { mutationScore: score, mutationScoreBasedOnCoveredCode: coveredScore } = metricsResult.metrics;
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

class FileColumn extends Column {
  constructor(rows: MetricsResult) {
    super('File', (row, ancestorCount) => spaces(ancestorCount) + (ancestorCount === 0 ? FILES_ROOT_NAME : row.name), rows);
  }
  protected override pad(input: string): string {
    return `${input} ${spaces(this.width - stringWidth(input) - 1)}`;
  }
}

class GroupWithColumns {
  constructor(
    public groupName: string,
    public columns: Column[],
  ) {}
}

/**
 * Represents a clear text table for mutation score
 */
export class ClearTextScoreTable {
  private readonly columns: Column[];
  private readonly groupedColumns: Array<GroupWithColumns> = [];

  constructor(
    private readonly metricsResult: MetricsResult,
    private readonly options: StrykerOptions,
  ) {
    this.columns = [
      new FileColumn(metricsResult),
      new MutationScoreColumn(metricsResult, options.thresholds, 'total', '% Mutation score'),
      new MutationScoreColumn(metricsResult, options.thresholds, 'covered', '% Mutation score'),
      new Column(`${options.clearTextReporter.allowEmojis ? '✅' : '#'} killed`, (row) => row.metrics.killed.toString(), metricsResult),
      new Column(`${options.clearTextReporter.allowEmojis ? '⌛️' : '#'} timeout`, (row) => row.metrics.timeout.toString(), metricsResult),
      new Column(`${options.clearTextReporter.allowEmojis ? '👽' : '#'} survived`, (row) => row.metrics.survived.toString(), metricsResult),
      new Column(`${options.clearTextReporter.allowEmojis ? '🙈' : '#'} no cov`, (row) => row.metrics.noCoverage.toString(), metricsResult),
      new Column(
        `${options.clearTextReporter.allowEmojis ? '💥' : '#'} errors`,
        (row) => (row.metrics.runtimeErrors + row.metrics.compileErrors).toString(),
        metricsResult,
      ),
    ];

    this.groupColumns();
  }

  private groupColumns() {
    for (const column of this.columns) {
      if (column.group) {
        const group = this.groupedColumns.find((g) => g.groupName === column.group);
        if (group) {
          group.columns.push(column);
        } else {
          this.groupedColumns.push(new GroupWithColumns(column.group, [column]));
        }
      } else {
        this.groupedColumns.push(new GroupWithColumns('', [column]));
      }
    }
  }

  private drawGroupHeader() {
    const cells: string[] = [];
    for (const currentGroup of this.groupedColumns) {
      cells.push(
        this.pad(
          currentGroup.groupName,
          currentGroup.columns.reduce((acc, column) => acc + column.width, 0),
        ),
      );
    }

    return `${cells.join('|')}|`;
  }

  private pad(text: string, width: number): string {
    const padding = Math.max(0, width - stringWidth(text) - 2);
    if (text.length >= width) {
      return `${text} `;
    }
    return ` ${text}${' '.repeat(padding)} `;
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

  private drawTableBody(current = this.metricsResult, ancestorCount = 0): string[] {
    const rows: string[] = [];
    if (!this.options.clearTextReporter.skipFull || current.metrics.mutationScore !== 100) {
      rows.push(this.drawRow((c) => c.drawTableCell(current, ancestorCount)));
    }
    rows.push(...current.childResults.flatMap((child) => this.drawTableBody(child, ancestorCount + 1)));
    return rows;
  }

  /**
   * Returns a string with the score results drawn in a table.
   */
  public draw(): string {
    return [
      this.drawBorder(),
      this.drawGroupHeader(),
      this.drawHeader(),
      this.drawBorder(),
      this.drawTableBody().join(os.EOL),
      this.drawBorder(),
    ].join(os.EOL);
  }
}
