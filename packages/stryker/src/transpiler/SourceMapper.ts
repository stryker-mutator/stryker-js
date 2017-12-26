import * as path from 'path';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
import { File, FileKind, TextFile, Location } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { base64Decode } from '../utils/objectUtils';

const SOURCE_MAP_URL_REGEX = /\/\/\s*#\s*sourceMappingURL=(.*)/g;

export interface MappedLocation {
  fileName: string;
  location: Location;
}

interface SourceMapInfo {
  transpiledFile: TextFile;
  sourceMapFileName: string;
  sourceMap: SourceMapConsumer;
}

interface SourceMapInfoBySource {
  [sourceFileName: string]: SourceMapInfo;
}

export class SourceMapError extends Error {
  constructor(message: string) {
    super(`${message}. Cannot analyse code coverage. Setting \`coverageAnalysis: "off"\` in your stryker.conf.js will prevent this error, but forces Stryker to run each test for each mutant.`);
    Error.captureStackTrace(this, SourceMapError);
    // TS recommendation: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, SourceMapError.prototype);
  }
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

export class TranspiledSourceMapper extends SourceMapper {

  private sourceMaps: SourceMapInfoBySource;

  constructor(private transpiledFiles: File[]) {
    super();
  }

  transpiledLocationFor(originalLocation: MappedLocation): MappedLocation {
    const sourceMapInfo = this.getSourceMap(originalLocation.fileName);
    if (!sourceMapInfo) {
      throw new SourceMapError(`Source map not found for "${originalLocation.fileName}"`);
    } else {
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

  private getSourceMap(sourceFileName: string): SourceMapInfo {
    if (!this.sourceMaps) {
      this.sourceMaps = this.createSourceMaps();
    }
    return this.sourceMaps[path.resolve(sourceFileName)];
  }

  private createSourceMaps(): SourceMapInfoBySource {
    const sourceMaps: SourceMapInfoBySource = Object.create(null);
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
      this.getSourceMapFromDataUrl(sourceMapUrl, transpiledFile) : this.getSourceMapFromTranspiledFiles(sourceMapUrl, transpiledFile);
    if (sourceMapFile.kind === FileKind.Text) {
      return sourceMapFile;
    } else {
      throw new SourceMapError(`Source map file "${sourceMapFile.name}" has the wrong file kind. "${FileKind[sourceMapFile.kind]}" instead of "${FileKind[FileKind.Text]}"`);
    }
  }

  private isDataUrl(sourceMapUrl: string) {
    return sourceMapUrl.startsWith('data:');
  }

  private getSourceMapFromDataUrl(sourceMapUrl: string, transpiledFile: File): TextFile {
    const supportedDataPrefix = 'data:application/json;base64,';
    if (sourceMapUrl.startsWith(supportedDataPrefix)) {
      const content = base64Decode(sourceMapUrl.substr(supportedDataPrefix.length));
      return {
        name: transpiledFile.name,
        content,
        kind: FileKind.Text,
        included: false,
        mutated: false,
        transpiled: false
      };
    } else {
      throw new SourceMapError(`Source map file for "${transpiledFile.name}" cannot be read. Data url "${sourceMapUrl.substr(0, sourceMapUrl.lastIndexOf(','))}" found, where "${supportedDataPrefix.substr(0, supportedDataPrefix.length - 1)}" was expected`);
    }
  }

  private getSourceMapFromTranspiledFiles(sourceMapUrl: string, transpiledFile: File) {
    const sourceMapFileName = path.resolve(path.dirname(transpiledFile.name), sourceMapUrl);
    const sourceMapFile = this.transpiledFiles.find(file => path.resolve(file.name) === sourceMapFileName);
    if (sourceMapFile) {
      return sourceMapFile;
    } else {
      throw new SourceMapError(`Source map file "${sourceMapUrl}" (referenced by "${transpiledFile.name}") cannot be found in list of transpiled files`);
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
      throw new SourceMapError(`No source map reference found in transpiled file "${transpiledFile.name}"`);
    }
  }
}

export class PassThroughSourceMapper extends SourceMapper {
  transpiledLocationFor(originalLocation: MappedLocation): MappedLocation {
    return originalLocation;
  }
}