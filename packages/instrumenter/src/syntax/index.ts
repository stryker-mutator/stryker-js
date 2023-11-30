import type { types as babelTypes } from '@babel/core';
import { Position } from '@stryker-mutator/api/core';

export enum AstFormat {
  Html = 'html',
  JS = 'js',
  TS = 'ts',
  Tsx = 'tsx',
  Svelte = 'svelte',
}

export interface AstByFormat {
  [AstFormat.Html]: HtmlAst;
  [AstFormat.JS]: JSAst;
  [AstFormat.TS]: TSAst;
  [AstFormat.Tsx]: TsxAst;
  [AstFormat.Svelte]: SvelteAst;
}
export type Ast = HtmlAst | JSAst | SvelteAst | TSAst | TsxAst;

export type ScriptFormat = AstFormat.JS | AstFormat.TS | AstFormat.Tsx;
export type ScriptAst = JSAst | TSAst | TsxAst;
export interface BaseAst {
  originFileName: string;
  rawContent: string;
  root: Ast['root'];
  offset?: Position;
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
 * Represents a TS AST
 */
export interface TsxAst extends BaseAst {
  format: AstFormat.Tsx;
  root: babelTypes.File;
}

/**
 * Represents a Svelte AST
 */
export interface SvelteAst extends BaseAst {
  format: AstFormat.Svelte;
  root: SvelteRootNode;
}

/**
 * Represents the root node of an HTML AST
 * We've taken a shortcut here, instead of representing the entire AST, we're only representing the script tags.
 * We might need to expand this in the future if we would ever want to support mutating the actual HTML (rather than only the JS/TS)
 */
export interface HtmlRootNode {
  scripts: ScriptAst[];
}

export interface SvelteRootNode {
  moduleScript?: TemplateScript;
  additionalScripts: TemplateScript[];
}

/**
 * Represents a svelte script or binding expression
 * We've taken a shortcut here, instead of representing the entire AST, we're only representing the script tags and expression bindings.
 */
export interface TemplateScript {
  ast: ScriptAst;
  range: Range;
  isExpression: boolean;
}

export interface Range {
  start: number;
  end: number;
}
