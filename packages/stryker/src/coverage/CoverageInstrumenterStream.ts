import { StatementMap } from 'stryker-api/test_runner';
import { Transform, TransformOptions } from 'stream';
import { Instrumenter } from 'istanbul';
import * as log4js from 'log4js';

const coverageObjRegex = /\{.*"path".*"fnMap".*"statementMap".*"branchMap".*\}/g;
const log = log4js.getLogger('CoverageInstrumenterStream');

/**
 * Represents a stream responsible to add code coverage instrumentation and reporting back on the statement map
 */
export default class CoverageInstrumenterStream extends Transform {

  private source: string;
  public statementMap: StatementMap;

  constructor(public coverageVariable: string, private filename: string, opts?: TransformOptions) {
    super(opts);
    this.source = '';
  }

  _transform(chunk: Buffer | string, encoding: string, callback: Function): void {
    if (typeof chunk === 'string') {
      this.source += chunk;
    } else {
      this.source += chunk.toString();
    }
    callback();
  }

  _flush(callback: Function): void {
    try {
      const instrumenter = new Instrumenter({ coverageVariable: this.coverageVariable });
      const instrumentedCode = instrumenter.instrumentSync(this.source, this.filename);
      coverageObjRegex.lastIndex = 0;
      const coverageObjectMatch = coverageObjRegex.exec(instrumentedCode) + '';
      const coverageObj = JSON.parse(coverageObjectMatch);
      this.statementMap = coverageObj.statementMap;
      Object.keys(this.statementMap).forEach(key => {
        // Lines from istanbul are one-based, lines in Stryker are 0-based
        this.statementMap[key].end.line--;
        this.statementMap[key].start.line--;
      });
      this.push(instrumentedCode);
    } catch (err) {
      const error = `Error while instrumenting file "${this.filename}", error was: ${err.toString()}`;
      log.error(error);
      this.push(this.source);
    }
    callback();
  }
}