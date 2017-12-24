import * as path from 'path';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
import { File, FileKind, TextFile, Location } from 'stryker-api/core';
import { Config } from 'stryker-api/config';

const SOURCE_MAP_URL_REGEX = /\/\/#\s*sourceMappingURL=(.*)/g;

export interface MappedLocation {
  fileName: string;
  location: Location;
}

export default abstract class SourceMapper {
  abstract transpiledLocationFor(originalLocation: MappedLocation): MappedLocation;

  static create(transpiledFiles: File[], config: Config): SourceMapper {
    if (config.transpilers.length && config.coverageAnalysis !== 'off') {
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

export class TranspiledSourceMapper extends SourceMapper {

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
    const sourceMappingUrl = this.getSourceMapUrl(transpiledFile);
    const sourceMapFile = this.getSourceMapFileFromUrl(sourceMappingUrl, transpiledFile);
    return sourceMapFile;
  }

  private getSourceMapFileFromUrl(sourceMapUrl: string, transpiledFile: File): TextFile {
    const sourceMapFile = this.isDataUrl(sourceMapUrl) ?
      this.getSourceMapFromDataUrl(sourceMapUrl, transpiledFile) : this.getSourceMapFromDisk(sourceMapUrl, transpiledFile);
    if (sourceMapFile.kind === FileKind.Text) {
      return sourceMapFile;
    } else {
      throw new Error(`Source map file ${sourceMapFile.name} was of wrong file kind. '${FileKind[sourceMapFile.kind]}' instead of '${FileKind[FileKind.Text]}'`);
    }
  }

  private isDataUrl(sourceMapUrl: string) {
    return sourceMapUrl.startsWith('data:');
  }

  private getSourceMapFromDataUrl(sourceMapUrl: string, transpiledFile: File): TextFile {
    const supportedDataPrefix = 'data:application/json;base64,';
    if (sourceMapUrl.startsWith(supportedDataPrefix)) {
      const content = Buffer.from(sourceMapUrl.substr(supportedDataPrefix.length), 'base64').toString('utf8');
      return {
        name: transpiledFile.name,
        content,
        kind: FileKind.Text,
        included: false,
        mutated: false,
        transpiled: false
      };
    } else {
      throw new Error('Source map cannot be read. The data type ' + sourceMapUrl.substr(0, sourceMapUrl.lastIndexOf(',')) + ' is not supported. Found in file' + transpiledFile.name);
    }
  }

  private getSourceMapFromDisk(sourceMapUrl: string, transpiledFile: File) {
    const sourceMapFileName = path.resolve(path.dirname(transpiledFile.name), sourceMapUrl);
    const sourceMapFile = this.transpiledFiles.find(file => path.resolve(file.name) === sourceMapFileName);
    if (sourceMapFile) {
      return sourceMapFile;
    } else {
      throw new Error(`Source map file ${sourceMapFileName} could not be found.`);
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

  transpiledLocationFor(originalLocation: MappedLocation): MappedLocation {
    const sourceMapInfo = this.sourceMaps[originalLocation.fileName];
    if (sourceMapInfo === null) {
      throw new Error('Source map not found for ' + originalLocation.fileName);
    }
    const relativeSource = path.relative(path.dirname(sourceMapInfo.sourceMapFileName), originalLocation.fileName)
      .replace(/\\/g, '/');
    const start = sourceMapInfo.sourceMap.generatedPositionFor({
      bias: SourceMapConsumer.LEAST_UPPER_BOUND,
      column: originalLocation.location.start.column,
      line: originalLocation.location.start.line + 1, // source maps works 1-based
      source: relativeSource
    });
    const end = sourceMapInfo.sourceMap.generatedPositionFor({
      bias: SourceMapConsumer.LEAST_UPPER_BOUND,
      column: originalLocation.location.end.column,
      line: originalLocation.location.end.line + 1, // source maps works 1-based
      source: relativeSource
    });
    return {
      fileName: sourceMapInfo.transpiledFile.name,
      location: {
        start: {
          line: start.line - 1,  // Stryker works 0-based
          column: start.column
        },
        end: {
          line: end.line - 1,  // Stryker works 0-based
          column: end.column
        }
      }
    };
  }
}

export class PassThroughSourceMapper extends SourceMapper {
  transpiledLocationFor(originalLocation: MappedLocation): MappedLocation {
    return originalLocation;
  }
}