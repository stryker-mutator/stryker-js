import { File } from 'stryker-api/core';
import { Transpiler, TranspileResult, TranspilerOptions, TranspilerFactory } from 'stryker-api/transpile';

class NamedTranspiler {
  constructor(public name: string, public transpiler: Transpiler) { }
}

export default class TranspilerFacade implements Transpiler {

  private innerTranspilers: NamedTranspiler[];

  constructor(options: TranspilerOptions, additionalTranspiler?: { name: string, transpiler: Transpiler }) {
    this.innerTranspilers = options.config.transpilers
      .map(transpilerName => new NamedTranspiler(transpilerName, TranspilerFactory.instance().create(transpilerName, options)));
    if (additionalTranspiler) {
      this.innerTranspilers.push(new NamedTranspiler(additionalTranspiler.name, additionalTranspiler.transpiler));
    }
  }

  public transpile(files: File[]): Promise<TranspileResult> {
    return this.performTranspileChain(this.createPassThruTranspileResult(files));
  }

  private async performTranspileChain(
    currentResult: TranspileResult,
    remainingChain: NamedTranspiler[] = this.innerTranspilers.slice()
  ): Promise<TranspileResult> {
    const next = remainingChain.shift();
    if (next) {
      const nextResult = await next.transpiler.transpile(currentResult.outputFiles);
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