import { File } from 'stryker-api/core';
import { Transpiler, TranspilerOptions, TranspilerFactory } from 'stryker-api/transpile';
import StrykerError from '../utils/StrykerError';

class NamedTranspiler {
  constructor(public name: string, public transpiler: Transpiler) { }
}

export default class TranspilerFacade implements Transpiler {

  private innerTranspilers: NamedTranspiler[];

  constructor(options: TranspilerOptions) {
    this.innerTranspilers = options.config.transpilers
      .map(transpilerName => new NamedTranspiler(transpilerName, TranspilerFactory.instance().create(transpilerName, options)));
  }

  public transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    return this.performTranspileChain(files);
  }

  private async performTranspileChain(
    input: ReadonlyArray<File>,
    remainingChain: NamedTranspiler[] = this.innerTranspilers.slice()
  ): Promise<ReadonlyArray<File>> {
    const current = remainingChain.shift();
    if (current) {
      const output = await current.transpiler.transpile(input)
        .catch(error => {
          throw new StrykerError(`An error occurred in transpiler "${current.name}"`, error);
        });
      return this.performTranspileChain(output, remainingChain);
    } else {
      return input;
    }
  }

}