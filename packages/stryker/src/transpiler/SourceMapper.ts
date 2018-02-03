import * as path from 'path';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
import { File, FileKind, TextFile, Location, Position } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { base64Decode } from '../utils/objectUtils';

const SOURCE_MAP_URL_REGEX = /\/\/\s*#\s*sourceMappingURL=(.*)/g;


// This file contains source mapping logic.
// It reads transpiled output files (*.js) and scans it for comments like these: sourceMappingURL=*.js.map
// If it finds it, it will use mozilla's source-map to implement the `transpiledLocationFor` method.


export interface MappedLocation {
  fileName: string;
  location: Location;
}

export class SourceMapError extends Error {
  constructor(message: string) {
    super(`${message}. Cannot analyse code coverage. Setting \`coverageAnalysis: "off"\` in your stryker.conf.js will prevent this error, but forces Stryker to run each test for each mutant.`);
    Error.captureStackTrace(this, SourceMapError);
    // TS recommendation: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, SourceMapError.prototype);
  }
}

/**
 * Represents an object that can calculated a transpiled location for a given original location
 * It is implemented with the [composite pattern](https://en.wikipedia.org/wiki/Composite_pattern)
 * Use the `create` method to retrieve a specific `SourceMapper` implementation
 */
export default abstract class SourceMapper {
  /**
   * Calculated a transpiled location for a given original location
   * @param originalLocation The original location to be converted to a transpiled location
   */
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

  private sourceMaps: SourceMapBySource;

  constructor(private transpiledFiles: File[]) {
    super();
  }

  /**
   * @inheritdoc
   */
  transpiledLocationFor(originalLocation: MappedLocation): MappedLocation {
    const sourceMap = this.getSourceMap(originalLocation.fileName);
    if (!sourceMap) {
      throw new SourceMapError(`Source map not found for "${originalLocation.fileName}"`);
    } else {
      const relativeSource = this.getRelativeSource(sourceMap, originalLocation);
      const start = sourceMap.generatedPositionFor(originalLocation.location.start, relativeSource);
      const end = sourceMap.generatedPositionFor(originalLocation.location.end, relativeSource);
      return {
        fileName: sourceMap.transpiledFile.name,
        location: {
          start,
          end
        }
      };
    }
  }

  private getRelativeSource(from: SourceMap, to: MappedLocation) {
    return path.relative(path.dirname(from.sourceMapFileName), to.fileName)
      .replace(/\\/g, '/');
  }

  /**
   * Gets the source map for given file
   */
  private getSourceMap(sourceFileName: string): SourceMap | undefined {
    if (!this.sourceMaps) {
      this.sourceMaps = this.createSourceMaps();
    }
    return this.sourceMaps[path.resolve(sourceFileName)];
  }

  /**
   * Creates all source maps for lazy loading purposes
   */
  private createSourceMaps(): SourceMapBySource {
    const sourceMaps: SourceMapBySource = Object.create(null);
    this.transpiledFiles.forEach(transpiledFile => {
      if (transpiledFile.mutated && transpiledFile.kind === FileKind.Text) {
        const sourceMapFile = this.getSourceMapForFile(transpiledFile);
        const rawSourceMap: RawSourceMap = JSON.parse(sourceMapFile.content);
        const sourceMap = new SourceMap(transpiledFile, sourceMapFile.name, rawSourceMap);
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

  /**
   * Gets the source map file from a url.
   * @param sourceMapUrl The source map url. Can be a data url (data:application/json;base64,ABC...), or an actual file url
   * @param transpiledFile The transpiled file for which the data url is 
   */
  private getSourceMapFileFromUrl(sourceMapUrl: string, transpiledFile: File): TextFile {
    const sourceMapFile = this.isInlineUrl(sourceMapUrl) ?
      this.getInlineSourceMap(sourceMapUrl, transpiledFile) : this.getExternalSourceMap(sourceMapUrl, transpiledFile);
    if (sourceMapFile.kind === FileKind.Text) {
      return sourceMapFile;
    } else {
      throw new SourceMapError(`Source map file "${sourceMapFile.name}" has the wrong file kind. "${FileKind[sourceMapFile.kind]}" instead of "${FileKind[FileKind.Text]}"`);
    }
  }

  private isInlineUrl(sourceMapUrl: string) {
    return sourceMapUrl.startsWith('data:');
  }

  /**
   * Gets the source map from a data url 
   */
  private getInlineSourceMap(sourceMapUrl: string, transpiledFile: File): TextFile {
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

  /**
   * Gets the source map from a file
   */
  private getExternalSourceMap(sourceMapUrl: string, transpiledFile: File) {
    const sourceMapFileName = path.resolve(path.dirname(transpiledFile.name), sourceMapUrl);
    const sourceMapFile = this.transpiledFiles.find(file => path.resolve(file.name) === sourceMapFileName);
    if (sourceMapFile) {
      return sourceMapFile;
    } else {
      throw new SourceMapError(`Source map file "${sourceMapUrl}" (referenced by "${transpiledFile.name}") cannot be found in list of transpiled files`);
    }
  }

  /**
   * Gets the source map url from a transpiled file (the last comment with sourceMappingURL= ...)
   */
  private getSourceMapUrl(transpiledFile: TextFile): string {
    SOURCE_MAP_URL_REGEX.lastIndex = 0;
    let currentMatch: RegExpExecArray | null;
    let lastMatch: RegExpExecArray | null = null;
    // Retrieve the final sourceMappingURL comment in the file
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

  /**
   * @inheritdoc
   */
  transpiledLocationFor(originalLocation: MappedLocation): MappedLocation {
    return originalLocation;
  }
}


class SourceMap {
  private sourceMap: SourceMapConsumer;
  constructor(public transpiledFile: TextFile, public sourceMapFileName: string, rawSourceMap: RawSourceMap) {
    this.sourceMap = new SourceMapConsumer(rawSourceMap);
  }
  generatedPositionFor(originalPosition: Position, relativeSource: string): Position {
    const transpiledPosition = this.sourceMap.generatedPositionFor({
      bias: SourceMapConsumer.LEAST_UPPER_BOUND,
      column: originalPosition.column,
      line: originalPosition.line + 1, // SourceMapConsumer works 1-based
      source: relativeSource
    });
    return {
      line: transpiledPosition.line - 1,  // Stryker works 0-based
      column: transpiledPosition.column
    };
  }
}

interface SourceMapBySource {
  [sourceFileName: string]: SourceMap;
}
