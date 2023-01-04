import { BaseNode, Program } from 'estree';
import { parse as svelteParse, walk } from 'svelte/compiler';
import { Ast as InternalSvelteAst, ConstTag, MustacheTag } from 'svelte/types/compiler/interfaces.js';

import babel from '@babel/core';

import { AstFormat, SvelteAst, SvelteBinding, SvelteRootNode, SvelteScriptTag } from '../syntax/index.js';

import { ParserContext } from './parser-context.js';

const { parse: babelParse } = babel;

const header = '<script></script>\n\n';

export async function parse(text: string, fileName: string, context: ParserContext): Promise<SvelteAst> {
  let ast = svelteParse(text);

  if (!ast.instance && !ast.module) {
    text = header + text;
    ast = svelteParse(text);
  }

  const root = await astParse(ast, text, fileName, context);

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Svelte,
    root: root,
  };
}

async function astParse(root: InternalSvelteAst, text: string, fileName: string, context: ParserContext): Promise<SvelteRootNode> {
  const mainScript = await getMainScript(root, text, fileName, context);
  const additionalScripts = await getAdditionalScripts(root, text, fileName, context);
  const bindingExpressions = getBindingExpressions(root, text);

  return {
    mainScript: mainScript,
    additionalScripts: additionalScripts,
    bindingExpressions: bindingExpressions,
  };
}

async function sliceScript(text: string, fileName: string, program: Program, context: ParserContext): Promise<SvelteScriptTag> {
  const { start, end } = program as unknown as { start: number; end: number };
  const parsed = await context.parse(text.slice(start, end), fileName, AstFormat.JS);
  return { ast: parsed, range: { start, end } };
}

function getMainScript(ast: InternalSvelteAst, text: string, fileName: string, context: ParserContext): Promise<SvelteScriptTag> {
  if (ast.instance?.content) {
    return sliceScript(text, fileName, ast.instance.content, context);
  } else {
    return sliceScript(text, fileName, ast.module!.content, context);
  }
}

function getAdditionalScripts(svelteAst: InternalSvelteAst, text: string, fileName: string, context: ParserContext): Promise<SvelteScriptTag[]> {
  const additionalScriptsAsPromised: Array<Promise<SvelteScriptTag>> = [];

  if (svelteAst.instance?.content && svelteAst.module?.content) {
    additionalScriptsAsPromised.push(sliceScript(text, fileName, svelteAst.module.content, context));
  }

  walk(svelteAst.html, {
    enter(node: any) {
      if (node.name === 'script' && node.children[0]) {
        const promise = context.parse(node.children[0].data as string, fileName, AstFormat.JS).then((ast) => ({
          ast,
          range: { start: node.children[0].start, end: node.children[0].end },
        }));
        additionalScriptsAsPromised.push(promise);
      }
    },
  });

  return Promise.all(additionalScriptsAsPromised);
}

function getBindingExpressions(svelteAst: InternalSvelteAst, text: string): SvelteBinding[] {
  const bindingExpressions: SvelteBinding[] = [];

  walk(svelteAst.html, {
    enter(node: BaseNode) {
      const bindingExpression = collectBindingExpression(node);
      if (bindingExpression) {
        const { start, end } = bindingExpression as unknown as { start: number; end: number };
        const astBabel = babelParse(text.substring(start, end));
        bindingExpressions.push({ ast: astBabel, range: { start, end } });
      }
    },
  });

  return bindingExpressions;
}

function collectBindingExpression(node: BaseNode) {
  switch (node.type) {
    case 'MustacheTag':
      return (node as MustacheTag).expression;
    case 'IfBlock':
      return (node as any).expression;
    case 'ConstTag':
      return (node as ConstTag).expression;
    case 'EachBlock':
      return (node as any).expression;
    case 'AwaitBlock':
      return (node as any).expression;
    case 'ArrowFunctionExpression':
      return (node as any).body;
    case 'KeyBlock':
      return (node as any).expression;
    default:
      return null;
  }
}
