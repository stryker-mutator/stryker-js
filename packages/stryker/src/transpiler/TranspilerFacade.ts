import { File } from 'stryker-api/core';
import { Transpiler, FileLocation, TranspileResult, TranspilerOptions, TranspilerFactory } from 'stryker-api/transpile';

class NamedTranspiler {
  constructor(public name: string, public transpiler: Transpiler) { }
}

export default class TranspilerFacade implements Transpiler {

  private innerTranspilers: NamedTranspiler[];

  constructor(options: TranspilerOptions) {
    this.innerTranspilers = options.config.transpilers
      .map(transpilerName => new NamedTranspiler(transpilerName, TranspilerFactory.instance().create(transpilerName, options)));
  }

  transpile(files: File[]): TranspileResult {
    return this.performTranspileChain(this.createPassThruTranspileResult(files));
  }

  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    return this.performMappedLocationChain(sourceFileLocation);
  }

  private performMappedLocationChain(
    sourceFileLocation: FileLocation,
    remainingChain: NamedTranspiler[] = this.innerTranspilers.slice()
  ): FileLocation {
    const next = remainingChain.shift();
    if (next) {
      return this.performMappedLocationChain(next.transpiler.getMappedLocation(sourceFileLocation), remainingChain);
    } else {
      return sourceFileLocation;
    }
  }

  private performTranspileChain(
    currentResult: TranspileResult,
    remainingChain: NamedTranspiler[] = this.innerTranspilers.slice()
  ): TranspileResult {
    const next = remainingChain.shift();
    if (next) {
      const nextResult = next.transpiler.transpile(currentResult.outputFiles);
      if (nextResult.error) {
        nextResult.error = `Execute ${next.name}: ${nextResult.error}`;
        return nextResult;
      } else {
        return this.performTranspileChain(nextResult, remainingChain);
      }
    } else {
      return currentResult;
    }
  }

  private createPassThruTranspileResult(input: File[]): TranspileResult {
    return {
      error: null,
      outputFiles: input
    };
  }
}