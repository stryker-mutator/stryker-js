import type { types as babelTypes } from '@babel/core';

export enum AstFormat {
  Html = 'html',
  JS = 'js',
  TS = 'ts',
}

export type ScriptFormat = AstFormat.JS | AstFormat.TS;

export interface AstByFormat {
  [AstFormat.Html]: HtmlAst;
  [AstFormat.JS]: JSAst;
  [AstFormat.TS]: TSAst;
}

export interface BaseAst {
  originFileName: string;
  rawContent: string;
  root: Ast['root'];
}

/**
 * Represents an Html AST.
 */
export interface HtmlAst extends BaseAst {
  format: AstFormat.Html;
  root: HtmlRootNode;
}

/**
 * Represents a TS AST
 */
export interface JSAst extends BaseAst {
  format: AstFormat.JS;
  root: babelTypes.File;
}

/**
 * Represents a TS AST
 */
export interface TSAst extends BaseAst {
  format: AstFormat.TS;
  root: babelTypes.File;
}

/**
 * Represents the root node of an HTML AST
 * We've taken a shortcut here, instead of representing the entire AST, we're only representing the script tags.
 * We might need to expand this in the future if we would ever want to support mutating the actual HTML (rather than only the JS/TS)
 */
export interface HtmlRootNode {
  scripts: Array<JSAst | TSAst>;
}

export type Ast = HtmlAst | JSAst | TSAst;
