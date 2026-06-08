import { MutateDescription } from '@stryker-mutator/api/core';
import { I } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';

import { AstByFormat, AstFormat } from '../syntax/index.js';
import { instrumenterTokens } from '../instrumenter-tokens.js';

import { TransformerOptions } from './transformer-options.js';
import { createTransformBabel } from './babel-transformer.js';
import { transformHtml } from './html-transformer.js';
import { MutantCollector } from './mutant-collector.js';
import { createTransformSvelte } from './svelte-transformer.js';

/**
 * Transform the AST by generating mutants and placing them in the AST.
 * Supports all AST formats supported by Stryker.
 * @param ast The Abstract Syntax Tree
 * @param mutantCollector the mutant collector that will be used to register and administer mutants
 * @param transformerContext the options used during transforming
 */
export const createTransform = Object.assign(
  (
    babelTransformer: ReturnType<typeof createTransformBabel>,
    svelteTransformer: ReturnType<typeof createTransformSvelte>,
  ): Transform => {
    const transform: Transform = (ast, mutantCollector, transformerContext) => {
      const context: TransformerContext = {
        ...transformerContext,
        transform,
      };
      switch (ast.format) {
        case AstFormat.Html:
          transformHtml(ast, mutantCollector, context);
          break;
        case AstFormat.JS:
        case AstFormat.TS:
        case AstFormat.Tsx:
          babelTransformer(ast, mutantCollector, context);
          break;
        case AstFormat.Svelte:
          svelteTransformer(ast, mutantCollector, context);
      }
    };
    return transform;
  },
  {
    inject: [
      instrumenterTokens.babelTransformer,
      instrumenterTokens.svelteTransformer,
    ] as const,
  },
);

export type Transform = (
  ast: AstByFormat[AstFormat],
  mutantCollector: I<MutantCollector>,
  transformerContext: Omit<TransformerContext, 'transform'>,
) => void;

export type AstTransformer<T extends AstFormat> = (
  ast: AstByFormat[T],
  mutantCollector: I<MutantCollector>,
  context: TransformerContext,
) => void;

export interface TransformerContext {
  transform: AstTransformer<AstFormat>;
  options: TransformerOptions;
  mutateDescription: MutateDescription;
  logger: Logger;
}
