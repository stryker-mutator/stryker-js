import * as path from 'path';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
import { File, Location, Position, StrykerOptions } from '@stryker-mutator/api/core';
import { base64Decode } from '../utils/objectUtils';
import { getLogger } from 'log4js';
import { StrykerError } from '@stryker-mutator/util';

const sourceMapUrlRegex = /\/\/\s*#\s*sourceMappingURL=(.*)/g;

// This file contains source mapping logic.
// It reads transpiled output files (*.js) and scans it for comments like these: sourceMappingURL=*.js.map
// If it finds it, it will use mozilla's source-map to implement the `transpiledLocationFor` method.

export interface MappedLocation {
  fileName: string;
  location: Location;
}

export class SourceMapError extends StrykerError {
  constructor(message: string, innerError?: Error) {
    super(`${message}. Cannot analyse code coverage. Setting \`coverageAnalysis: "off"\` in your stryker.conf.js will prevent this error, but forces Stryker to run each test for each mutant.`,
      innerError);
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
  public abstract async transpiledLocationFor(originalLocation: MappedLocation): Promise<MappedLocation>;

  public abstract transpiledFileNameFor(originalFileName: string): string;

  public static create(transpiledFiles: ReadonlyArray<File>, options: StrykerOptions): SourceMapper {
    if (options.transpilers.length && options.coverageAnalysis !== 'off') {
      return new TranspiledSourceMapper(transpiledFiles);
    } else {
      return new PassThroughSourceMapper();
    }
  }
}

export class TranspiledSourceMapper extends SourceMapper {

  private sourceMaps: SourceMapBySource;
  private readonly log = getLogger(SourceMapper.name);

  constructor(private readonly transpiledFiles: ReadonlyArray<File>) {
    super();
  }

  /**
   * @inheritDoc
   */
  public transpiledFileNameFor(originalFileName: string) {
    const sourceMap = this.getSourceMap(originalFileName);
    return sourceMap.transpiledFile.name;
  }

  /**
   * @inheritdoc
   */
  public async transpiledLocationFor(originalLocation: MappedLocation): Promise<MappedLocation> {
    const sourceMap = this.getSourceMap(originalLocation.fileName);
    const relativeSource = this.getRelativeSource(sourceMap, originalLocation);
    const start = await sourceMap.generatedPositionFor(originalLocation.location.start, relativeSource);
    const end = await sourceMap.generatedPositionFor(originalLocation.location.end, relativeSource);
    return {
      fileName: sourceMap.transpiledFile.name,
      location: {
        end,
        start
      }
    };
  }

  private getRelativeSource(from: SourceMap, to: MappedLocation) {
    return path.relative(path.dirname(from.sourceMapFileName), to.fileName)
      .replace(/\\/g, '/');
  }

  /**
   * Gets the source map for given file
   */
  private getSourceMap(sourceFileName: string): SourceMap {
    if (!this.sourceMaps) {
      this.sourceMaps = this.createSourceMaps();
    }
    const sourceMap: SourceMap | undefined = this.sourceMaps[path.resolve(sourceFileName)];
    if (sourceMap) {
      return sourceMap;
    } else {
      throw new SourceMapError(`Source map not found for "${sourceFileName}"`);
    }
  }

  /**
   * Creates all source maps for lazy loading purposes
   */
  private createSourceMaps(): SourceMapBySource {
    const sourceMaps: SourceMapBySource = Object.create(null);
    this.transpiledFiles.forEach(transpiledFile => {
      const sourceMapFile = this.getSourceMapForFile(transpiledFile);
      if (sourceMapFile) {
        const rawSourceMap = this.getRawSourceMap(sourceMapFile);
        const sourceMap = new SourceMap(transpiledFile, sourceMapFile.name, rawSourceMap);
        rawSourceMap.sources.forEach(source => {
          const sourceFileName = path.resolve(path.dirname(sourceMapFile.name), source);
          sourceMaps[sourceFileName] = sourceMap;
        });
      }
    });
    return sourceMaps;
  }

  private getRawSourceMap(sourceMapFile: File): RawSourceMap {
    try {
      return JSON.parse(sourceMapFile.textContent);
    } catch (error) {
      throw new SourceMapError(`Source map file "${sourceMapFile.name}" could not be parsed as json`, error);
    }
  }

  private getSourceMapForFile(transpiledFile: File): File | null {
    const sourceMappingUrl = this.getSourceMapUrl(transpiledFile);
    if (sourceMappingUrl) {
      return this.getSourceMapFileFromUrl(sourceMappingUrl, transpiledFile);
    } else {
      return null;
    }
  }

  /**
   * Gets the source map file from a url.
   * @param sourceMapUrl The source map url. Can be a data url (data:application/json;base64,ABC...), or an actual file url
   * @param transpiledFile The transpiled file for which the data url is
   */
  private getSourceMapFileFromUrl(sourceMapUrl: string, transpiledFile: File): File {
    const sourceMapFile = this.isInlineUrl(sourceMapUrl) ?
      this.getInlineSourceMap(sourceMapUrl, transpiledFile) : this.getExternalSourceMap(sourceMapUrl, transpiledFile);
    return sourceMapFile;
  }

  private isInlineUrl(sourceMapUrl: string) {
    return sourceMapUrl.startsWith('data:');
  }

  /**
   * Gets the source map from a data url
   */
  private getInlineSourceMap(sourceMapUrl: string, transpiledFile: File): File {
    const supportedDataPrefix = 'data:application/json;base64,';
    if (sourceMapUrl.startsWith(supportedDataPrefix)) {
      const content = base64Decode(sourceMapUrl.substr(supportedDataPrefix.length));
      return new File(transpiledFile.name, content);
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
  private getSourceMapUrl(transpiledFile: File): string | null {
    sourceMapUrlRegex.lastIndex = 0;
    let currentMatch: RegExpExecArray | null;
    let lastMatch: RegExpExecArray | null = null;
    // Retrieve the final sourceMappingURL comment in the file
    while (currentMatch = sourceMapUrlRegex.exec(transpiledFile.textContent)) {
      lastMatch = currentMatch;
    }
    if (lastMatch) {
      this.log.debug('Source map url found in transpiled file "%s"', transpiledFile.name);
      return lastMatch[1];
    } else {
      this.log.debug('No source map url found in transpiled file "%s"', transpiledFile.name);
      return null;
    }
  }
}

export class PassThroughSourceMapper extends SourceMapper {

  /**
   * @inheritdoc
   */
  public transpiledFileNameFor(originalFileName: string): string {
    return originalFileName;
  }

  /**
   * @inheritdoc
   */
  public async transpiledLocationFor(originalLocation: MappedLocation): Promise<MappedLocation> {
    return Promise.resolve(originalLocation);
  }
}

class SourceMap {
  private sourceMap: SourceMapConsumer | undefined;
  constructor(public transpiledFile: File, public sourceMapFileName: string, private readonly rawSourceMap: RawSourceMap) {
  }
  public async generatedPositionFor(originalPosition: Position, relativeSource: string): Promise<Position> {
    if (!this.sourceMap) {
      this.sourceMap = await new SourceMapConsumer(this.rawSourceMap);
    }

    const transpiledPosition = await this.sourceMap.generatedPositionFor({
      bias: SourceMapConsumer.LEAST_UPPER_BOUND,
      column: originalPosition.column,
      line: originalPosition.line + 1, // SourceMapConsumer works 1-based
      source: relativeSource
    });

    return Promise.resolve({
      column: transpiledPosition.column || 0,
      line: (transpiledPosition.line || 1) - 1  // Stryker works 0-based
    });
  }
}

interface SourceMapBySource {
  [sourceFileName: string]: SourceMap;
}
