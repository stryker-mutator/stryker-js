import path from 'path';

import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { MutationRange } from '@stryker-mutator/api/core';
import { File } from '@stryker-mutator/util';

import { createParser } from './parsers/index.js';
import { transform, MutantCollector } from './transformers/index.js';
import { print } from './printers/index.js';
import { InstrumentResult } from './instrument-result.js';
import { InstrumenterOptions } from './instrumenter-options.js';
import { instrumenterTokens } from './instrumenter-tokens.js';

/**
 * The instrumenter is responsible for
 * * Generating mutants based on source files
 * * Instrumenting the source code with the mutants placed in `mutant switches`.
 * * Adding mutant coverage expressions in the source code.
 * @see https://github.com/stryker-mutator/stryker-js/issues/1514
 */
export class Instrumenter {
  public static inject = tokens(commonTokens.logger, instrumenterTokens.createParser, instrumenterTokens.print, instrumenterTokens.transform);

  constructor(
    private readonly logger: Logger,
    private readonly _createParser = createParser,
    private readonly _print = print,
    private readonly _transform = transform
  ) {}

  public async instrument(files: readonly File[], options: InstrumenterOptions): Promise<InstrumentResult> {
    this.logger.debug('Instrumenting %d source files with mutants', files.length);
    const mutantCollector = new MutantCollector();
    const outFiles: File[] = [];
    let mutantCount = 0;
    const parse = this._createParser(options);
    for await (const file of files) {
      const ast = await parse(file.textContent, file.name);
      this._transform(ast, mutantCollector, { options: { ...options, mutationRanges: options.mutationRanges.map(toBabelLineNumber) } });
      const mutatedContent = this._print(ast);
      outFiles.push(new File(file.name, mutatedContent));
      if (this.logger.isDebugEnabled()) {
        const nrOfMutantsInFile = mutantCollector.mutants.length - mutantCount;
        mutantCount = mutantCollector.mutants.length;
        this.logger.debug(`Instrumented ${path.relative(process.cwd(), file.name)} (${nrOfMutantsInFile} mutant(s))`);
      }
    }
    const mutants = mutantCollector.mutants.map((mutant) => mutant.toApiMutant());
    this.logger.info('Instrumented %d source file(s) with %d mutant(s)', files.length, mutants.length);
    return {
      files: outFiles,
      mutants,
    };
  }
}

function toBabelLineNumber(range: MutationRange): MutationRange {
  const start: number = range.start.line;
  const end: number = range.end.line;

  return {
    ...range,
    end: {
      ...range.end,
      line: end + 1,
    },
    start: {
      ...range.start,
      line: start + 1,
    },
  };
}
