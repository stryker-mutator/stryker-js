import { I } from '@stryker-mutator/util';

import { Ast, AstByFormat, AstFormat } from '../syntax';

import { TransformerOptions } from './transformer-options';
import { transformBabel } from './babel-transformer';
import { transformHtml } from './html-transformer';
import { MutantCollector } from './mutant-collector';

/**
 * Transform the AST by generating mutants and placing them in the AST.
 * Supports all AST formats supported by Stryker.
 * @param ast The Abstract Syntax Tree
 * @param mutantCollector the mutant collector that will be used to register and administer mutants
 * @param transformerContext the options used during transforming
 */
export function transform(ast: Ast, mutantCollector: I<MutantCollector>, transformerContext: Pick<TransformerContext, 'options'>): void {
  const context: TransformerContext = {
    transform,
    options: transformerContext.options,
  };
  switch (ast.format) {
    case AstFormat.Html:
      transformHtml(ast, mutantCollector, context);
      break;
    case AstFormat.JS:
    case AstFormat.TS:
      transformBabel(ast, mutantCollector, context);
      break;
  }
}

export type AstTransformer<T extends AstFormat> = (ast: AstByFormat[T], mutantCollector: I<MutantCollector>, context: TransformerContext) => void;

export interface TransformerContext {
  transform: AstTransformer<AstFormat>;
  options: TransformerOptions;
}
