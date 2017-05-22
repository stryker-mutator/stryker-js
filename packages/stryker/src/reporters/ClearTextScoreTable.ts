import { ScoreResult } from 'stryker-api/report';
import * as os from 'os';
import * as _ from 'lodash';
import * as chalk from 'chalk';

const FILES_ROOT_NAME = 'All files';

interface TableCellValueFactory {
  (row: ScoreResult, ancestorCount: number): string;
}

const spaces = (n: number): string => {
  if (n) {
    return ` ${spaces(n - 1)}`;
  } else {
    return '';
  }
};

const dots = (n: number): string => {
  if (n) {
    return `.${dots(n - 1)}`;
  } else {
    return '';
  }
};

/**
 * Represents a column in the clear text table
 */
class Column {
  protected width: number;

  constructor(public header: string, public valueFactory: TableCellValueFactory, public rows: ScoreResult) {
    const maxContentSize = this.determineValueSize();
    this.width = this.pad(dots(maxContentSize), maxContentSize).length;
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
   * @param targetLength The min length that has to be reached
   */
  protected pad(input: string, targetLength: number = this.width): string {
    // End with space
    if (!input.endsWith(' ')) {
      return this.pad(input + ' ', targetLength);
    }
    // Start with space
    else if (!input.startsWith(' ')) {
      return this.pad(' ' + input, targetLength);
    }
    else if (input.length < targetLength) {
      // Pad rest with spaces in front
      return spaces(targetLength - input.length) + input;
    } else {
      return input;
    }
  }

  drawLine(length = this.width): string {
    if (length) {
      return '-' + this.drawLine(length - 1);
    } else {
      return '';
    }
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
  protected pad(input: string, targetLength: number = this.width): string {
    if (!input.endsWith(' ')) {
      return this.pad(`${input} `, targetLength);
    } else if (input.length < targetLength) {
      return input + spaces(targetLength - input.length);
    } else {
      return input;
    }
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
      new Column('# no cvg', row => row.noCoverage.toString(), score),
      new Column('# error', row => row.errors.toString(), score)
    ];
  }

  private drawBorder() {
    return this.drawPerColumn(column => column.drawLine());
  }

  private drawHeader() {
    return this.drawPerColumn(c => c.drawHeader());
  }

  private drawPerColumn(toDraw: (col: Column) => string) {
    return this.columns.map(toDraw).join('|') + '|';
  }

  private drawValues(current = this.score, ancestorCount = 0): string[] {
    return [this.drawPerColumn(c => c.drawTableCell(current, ancestorCount))]
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