import { ScoreResult } from 'stryker-api/report';
import * as os from 'os';
import * as _ from 'lodash';
import * as chalk from 'chalk';

const FILES_ROOT_NAME = 'All files';

interface TableCellValueFactory {
  (row: ScoreResult, ancestorCount: number): string;
}

const repeat = (char: string, nTimes: number) => new Array(nTimes > -1 ? nTimes + 1 : 0).join(char);
const spaces = (n: number) => repeat(' ', n);
const dots = (n: number) => repeat('.', n);

/**
 * Represents a column in the clear text table
 */
class Column {
  protected width: number;

  constructor(public header: string, public valueFactory: TableCellValueFactory, public rows: ScoreResult) {
    const maxContentSize = this.determineValueSize();
    this.width = this.pad(dots(maxContentSize)).length;
  }

  protected determineValueSize(row: ScoreResult = this.rows, ancestorCount: number = 0): number {
    const valueWidths = row.childResults.map(child => this.determineValueSize(child, ancestorCount + 1));
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

  drawLine(): string {
    return repeat('-', this.width);
  }

  drawTableCell(score: ScoreResult, ancestorCount: number) {
    return this.color(score)(this.pad(this.valueFactory(score, ancestorCount)));
  }

  drawHeader() {
    return this.pad(this.header);
  }

  protected color(score: ScoreResult) {
    return (input: string) => input;
  }
}

class MutationScoreColumn extends Column {
  constructor(rows: ScoreResult) {
    super('% score', row => row.mutationScore.toFixed(2), rows);
  }
  protected color(score: ScoreResult) {
    if (score.mutationScore >= 80) {
      return chalk.green;
    } else if (score.mutationScore >= 60) {
      return chalk.yellow;
    } else {
      return chalk.red;
    }
  }
}

class FileColumn extends Column {
  constructor(rows: ScoreResult) {
    super('File', (row, ancestorCount) => spaces(ancestorCount) + (ancestorCount === 0 ? FILES_ROOT_NAME : row.name), rows);
  }
  protected pad(input: string): string {
    return `${input} ${spaces(this.width - input.length - 1)}`;
  }
}

/**
 * Represents a clear text table for mutation score
 */
export default class ClearTextScoreTable {

  private columns: Column[];

  constructor(private score: ScoreResult) {
    this.columns = [
      new FileColumn(score),
      new MutationScoreColumn(score),
      new Column('# killed', row => row.killed.toString(), score),
      new Column('# timeout', row => row.timedOut.toString(), score),
      new Column('# survived', row => row.survived.toString(), score),
      new Column('# no cov', row => row.noCoverage.toString(), score),
      new Column('# error', row => row.errors.toString(), score)
    ];
  }

  private drawBorder() {
    return this.drawRow(column => column.drawLine());
  }

  private drawHeader() {
    return this.drawRow(c => c.drawHeader());
  }

  private drawRow(toDraw: (col: Column) => string) {
    return this.columns.map(toDraw).join('|') + '|';
  }

  private drawValues(current = this.score, ancestorCount = 0): string[] {
    return [this.drawRow(c => c.drawTableCell(current, ancestorCount))]
      .concat(_.flatMap(current.childResults, child => this.drawValues(child, ancestorCount + 1)));
  }

  /**
   * Returns a string with the score results drawn in a table.
   */
  draw() {
    return [
      this.drawBorder(),
      this.drawHeader(),
      this.drawBorder(),
      this.drawValues().join(os.EOL),
      this.drawBorder()
    ].join(os.EOL);
  }
}