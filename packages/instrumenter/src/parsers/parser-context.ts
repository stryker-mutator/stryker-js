import { Ast, AstFormat, AstByFormat } from '../syntax/index.js';

export interface ParserContext {
  parse<T extends AstFormat>(
    code: string,
    fileName: string,
    formatOverride?: T,
  ): Promise<AstByFormat[T]>;
}

export type Parser<T extends Ast = Ast> = (
  text: string,
  fileName: string,
  context: ParserContext,
) => Promise<T>;
