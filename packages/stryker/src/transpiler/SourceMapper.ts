import * as path from 'path';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
import { File, FileKind, TextFile, Location } from 'stryker-api/core';

const SOURCE_MAP_URL_REGEX = /\/\/#\s*sourceMappingURL=(.*)/g;

export interface MappedLocation {
  fileName: string;
  location: Location;
}

export default abstract class SourceMapper {
  abstract transpiledLocationFor(needle: MappedLocation): MappedLocation;

  static create(transpiledFiles: File[], transpilers: string[]): SourceMapper {
    if (transpilers.length) {
      return new TranspiledSourceMapper(transpiledFiles);
    } else {
      return new PassThroughSourceMapper();
    }
  }
}

interface SourceMapBySource {
  [sourceFileName: string]: {
    transpiledFile: TextFile;
    sourceMapFileName: string;
    sourceMap: SourceMapConsumer;
  };
}

class TranspiledSourceMapper extends SourceMapper {

  private sourceMaps: SourceMapBySource;

  constructor(private transpiledFiles: File[]) {
    super();
    this.sourceMaps = this.createSourceMaps();
  }

  private createSourceMaps(): SourceMapBySource {
    const sourceMaps: SourceMapBySource = Object.create(null);
    this.transpiledFiles.forEach(transpiledFile => {
      if (transpiledFile.mutated && transpiledFile.kind === FileKind.Text) {
        const sourceMapFile = this.getSourceMapForFile(transpiledFile);
        const rawSourceMap: RawSourceMap = JSON.parse(sourceMapFile.content);
        const sourceMap = {
          transpiledFile,
          sourceMapFileName: sourceMapFile.name,
          sourceMap: new SourceMapConsumer(rawSourceMap)
        };
        rawSourceMap.sources.forEach(source => {
          const sourceFileName = path.resolve(path.dirname(sourceMapFile.name), source);
          sourceMaps[sourceFileName] = sourceMap;
        });
      }
    });
    return sourceMaps;
  }

  private getSourceMapForFile(transpiledFile: TextFile) {
    const sourceMappingFileName = this.getSourceMapUrl(transpiledFile);
    const sourceMappingFileFullName = path.resolve(path.dirname(transpiledFile.name), sourceMappingFileName);
    const sourceMapFile = this.transpiledFiles.find(file => path.resolve(file.name) === sourceMappingFileFullName);
    if (sourceMapFile) {
      if (sourceMapFile.kind === FileKind.Text) {
        return sourceMapFile;
      } else {
        throw new Error(`Source map file ${sourceMappingFileFullName} was of wrong file kind. '${FileKind[sourceMapFile.kind]}' instead of '${FileKind[FileKind.Text]}'`);
      }
    } else {
      throw new Error(`Source map file ${sourceMappingFileFullName} could not be found.`);
    }

  }

  private getSourceMapUrl(transpiledFile: TextFile): string {
    SOURCE_MAP_URL_REGEX.lastIndex = 0;
    let currentMatch: RegExpExecArray | null;
    let lastMatch: RegExpExecArray | null = null;
    while (currentMatch = SOURCE_MAP_URL_REGEX.exec(transpiledFile.content)) {
      lastMatch = currentMatch;
    }
    if (lastMatch) {
      return lastMatch[1];
    } else {
      throw new Error('Source map not defined for transpiled file: ' + transpiledFile.name);
    }
  }

  transpiledLocationFor(needle: MappedLocation): MappedLocation {
    const sourceMapInfo = this.sourceMaps[needle.fileName];
    if (sourceMapInfo === null) {
      throw new Error('Source map not found for ' + needle.fileName);
    }
    const relativeSource = path.relative(path.dirname(sourceMapInfo.sourceMapFileName), needle.fileName);
    const start = sourceMapInfo.sourceMap.generatedPositionFor({
      bias: SourceMapConsumer.LEAST_UPPER_BOUND,
      column: needle.location.start.column,
      line: needle.location.start.line + 1, // source maps works 1-based
      source: relativeSource
    });
    const end = sourceMapInfo.sourceMap.generatedPositionFor({
      bias: SourceMapConsumer.LEAST_UPPER_BOUND,
      column: needle.location.end.column,
      line: needle.location.end.line + 1, // source maps works 1-based
      source: relativeSource
    });
    end.line--; // Stryker works 0-based
    start.line--; // Stryker works 0-based
    return {
      fileName: sourceMapInfo.transpiledFile.name,
      location: {
        start,
        end
      }
    };
  }
}

export class PassThroughSourceMapper extends SourceMapper {
  transpiledLocationFor(needle: MappedLocation): MappedLocation {
    return needle;
  }
}