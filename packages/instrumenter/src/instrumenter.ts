import path from 'path';

import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { MutateDescription } from '@stryker-mutator/api/core';

import { createParser } from './parsers/index.js';
import { transform, MutantCollector } from './transformers/index.js';
import { print } from './printers/index.js';
import { InstrumentResult } from './instrument-result.js';
import { InstrumenterOptions } from './instrumenter-options.js';
import { instrumenterTokens } from './instrumenter-tokens.js';
import { File } from './file.js';

/**
 * The instrumenter is responsible for
 * * Generating mutants based on source files
 * * Instrumenting the source code with the mutants placed in `mutant switches`.
 * * Adding mutant coverage expressions in the source code.
 * @see https://github.com/stryker-mutator/stryker-js/issues/1514
 */
export class Instrumenter {
  public static inject = tokens(
    commonTokens.logger,
    instrumenterTokens.createParser,
    instrumenterTokens.print,
    instrumenterTokens.transform,
  );

  constructor(
    private readonly logger: Logger,
    private readonly _createParser = createParser,
    private readonly _print = print,
    private readonly _transform = transform,
  ) {}

  public async instrument(
    files: readonly File[],
    options: InstrumenterOptions,
  ): Promise<InstrumentResult> {
    this.logger.debug(
      'Instrumenting %d source files with mutants',
      files.length,
    );
    const mutantCollector = new MutantCollector();
    const outFiles: File[] = [];
    let mutantCount = 0;
    const parse = this._createParser(options);
    for (const { name, mutate, content } of files) {
      const ast = await parse(content, name);
      this._transform(ast, mutantCollector, {
        options,
        mutateDescription: toBabelLineNumber(mutate),
        logger: this.logger,
      });
      const mutatedContent = this._print(ast);
      outFiles.push({
        name,
        mutate,
        content: mutatedContent,
      });
      if (this.logger.isDebugEnabled()) {
        const nrOfMutantsInFile = mutantCollector.mutants.length - mutantCount;
        mutantCount = mutantCollector.mutants.length;
        this.logger.debug(
          `Instrumented ${path.relative(process.cwd(), name)} (${nrOfMutantsInFile} mutant(s))`,
        );
      }
    }
    const mutants = mutantCollector.mutants.map((mutant) =>
      mutant.toApiMutant(),
    );
    this.logger.info(
      'Instrumented %d source file(s) with %d mutant(s)',
      files.length,
      mutants.length,
    );
    return {
      files: outFiles,
      mutants,
    };
  }
}

function toBabelLineNumber(range: MutateDescription): MutateDescription {
  if (typeof range === 'boolean') {
    return range;
  } else {
    return range.map(({ start, end }) => ({
      start: {
        column: start.column,
        line: start.line + 1,
      },
      end: {
        column: end.column,
        line: end.line + 1,
      },
    }));
  }
}
