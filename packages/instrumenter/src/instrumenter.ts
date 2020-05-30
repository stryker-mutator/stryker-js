import path from 'path';

import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { File } from '@stryker-mutator/api/core';

import { parse } from './parsers';
import { transform, MutantCollector } from './transformers';
import { print } from './printers';
import { InstrumentResult } from './instrument-result';

/**
 * The instrumenter is responsible for
 * * Generating mutants based on source files
 * * Instrumenting the source code with the mutants placed in `mutant switches`.
 * * Adding mutant coverage expressions in the source code.
 * @see https://github.com/stryker-mutator/stryker/issues/1514
 */
export class Instrumenter {
  public static inject = tokens(commonTokens.logger);

  constructor(private readonly logger: Logger) {}

  public async instrument(files: File[]): Promise<InstrumentResult> {
    this.logger.debug('Instrumenting %d source files with mutants', files.length);
    const mutantCollector = new MutantCollector();
    const outFiles: File[] = [];
    let mutantCount = 0;
    for await (const file of files) {
      const ast = await parse(file.textContent, file.name);
      transform(ast, mutantCollector);
      const mutatedContent = print(ast);
      outFiles.push(new File(file.name, mutatedContent));
      if (this.logger.isDebugEnabled()) {
        const nrOfMutantsInFile = mutantCollector.mutants.length - mutantCount;
        mutantCount = mutantCollector.mutants.length;
        this.logger.debug(`Instrumented ${path.relative(process.cwd(), file.name)} (${nrOfMutantsInFile} mutant(s))`);
      }
    }
    return {
      files: outFiles,
      mutants: mutantCollector.mutants,
    };
  }
}
