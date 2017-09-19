import { Location, Position } from 'stryker-api/core';
import { SourceMapConsumer } from 'source-map';
import { FileLocation } from 'stryker-api/transpile';

export default class OutputFile {

  constructor(public name: string, public content: string, public sourceMapContent: string) {
  }

  getMappedLocation(sourceFileLocation: FileLocation): Location | null {
    const generatedStart = this.mappedPositionFor(sourceFileLocation.fileName, sourceFileLocation.start, SourceMapConsumer.GREATEST_LOWER_BOUND);
    const generatedEnd = this.mappedPositionFor(sourceFileLocation.fileName, sourceFileLocation.end, SourceMapConsumer.LEAST_UPPER_BOUND);
    if (generatedStart.column && generatedStart.line && generatedEnd.column && generatedEnd.line) {
      return {
        start: {
          line: generatedStart.line,
          column: generatedStart.column
        },
        end: {
          line: generatedEnd.line,
          column: generatedEnd.column
        }
      };
    } else {
      return null;
    }
  }

  private mappedPositionFor(sourceFileName: string, position: Position, bias: number) {
    return this.sourceMap.generatedPositionFor({
      source: sourceFileName,
      line: position.line,
      column: position.column,
      bias
    });
  }

  private _sourceMap: SourceMapConsumer;
  public get sourceMap(): SourceMapConsumer {
    if (!this._sourceMap) {
      const rawSourceMap = JSON.parse(this.sourceMapContent) as sourceMap.RawSourceMap;
      this._sourceMap = new SourceMapConsumer(rawSourceMap);
    }
    return this._sourceMap;
  }

}
