import { StrykerOptions } from '@stryker-mutator/api/core';
import { getTSConfig, isTypescriptFile, normalizeFileFromTypescript } from '../helpers/tsHelpers';

/**
 * Represents a transpile filter. This is the component that decides on which files needs to be transpiled.
 *
 * It is implemented using the composite pattern.
 * If there is a tsConfig, that will be used. If not, a default is used (transpile all TS-like files)
 */
export default abstract class TranspileFilter {
  public abstract isIncluded(fileName: string): boolean;

  public static create(options: StrykerOptions): TranspileFilter {
    const parsedCommandLine = getTSConfig(options);
    if (parsedCommandLine) {
      return new TSConfigFilter(parsedCommandLine);
    } else {
      return new DefaultFilter();
    }
  }
}

/**
 * A transpile filter based on ts config
 */
export class TSConfigFilter extends TranspileFilter {

  private readonly fileNames: string[];

  constructor({ fileNames }: { fileNames: string[] }) {
    super();
    this.fileNames = fileNames.map(normalizeFileFromTypescript);
  }

  public isIncluded(fileName: string): boolean {
    return this.fileNames.indexOf(fileName) !== -1;
  }
}

/**
 * A default transpile filter based on file extension
 */
export class DefaultFilter extends TranspileFilter {
  public isIncluded(fileName: string): boolean {
    return isTypescriptFile(fileName);
  }
}
