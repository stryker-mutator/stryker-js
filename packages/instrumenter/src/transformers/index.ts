import { I } from '@stryker-mutator/util';

import { AstFormat, AstByFormat, Ast } from '../syntax';

import { MutantCollector } from './mutant-collector';
import { transformHtml } from './html-transformer';
import { transformBabel } from './babel-transformer';

export { MutantCollector };

/**
 * Transform the AST by generating mutants and placing them in the AST.
 * Supports all AST formats supported by Stryker.
 * @param ast The Abstract Syntax Tree
 * @param mutantCollector the mutant collector that will be used to register and administer mutants
 */
export function transform(ast: Ast, mutantCollector: I<MutantCollector>): void {
  const context: TransformerContext = {
    transform,
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
}
