/* eslint-disable import/no-extraneous-dependencies */
import type { BaseNode, Position, Program, SourceLocation } from 'estree';

import type { Ast as InternalSvelteAst } from '../../../../node_modules/svelte/types/compiler/interfaces.js';

import { AstFormat, SvelteAst, SvelteRootNode, SvelteNode, Offset } from '../syntax/index.js';

import { ParserContext } from './parser-context.js';

const header = '<script></script>\n\n';

export async function parse(text: string, fileName: string, context: ParserContext): Promise<SvelteAst> {
  const { parse: svelteParse } = await import('svelte/compiler');
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

  return {
    mainScript: mainScript,
    additionalScripts: additionalScripts,
  };
}

async function sliceScript(text: string, fileName: string, program: Program, context: ParserContext): Promise<SvelteNode> {
  const { start, end, loc } = program as unknown as { start: number; end: number; loc: SourceLocation };
  const scriptText = text.slice(start, end);
  const parsed = await context.parse(scriptText, fileName, AstFormat.JS);
  return {
    ast: {
      ...parsed,
      offset: toOffset(loc.start),
    },
    range: { start, end },
  };
}

function getMainScript(ast: InternalSvelteAst, text: string, fileName: string, context: ParserContext): Promise<SvelteNode> {
  if (ast.instance?.content) {
    return sliceScript(text, fileName, ast.instance.content, context);
  } else {
    return sliceScript(text, fileName, ast.module!.content, context);
  }
}

async function getAdditionalScripts(svelteAst: InternalSvelteAst, text: string, fileName: string, context: ParserContext): Promise<SvelteNode[]> {
  const additionalScriptsAsPromised: Array<Promise<SvelteNode>> = [];

  if (svelteAst.instance?.content && svelteAst.module?.content) {
    additionalScriptsAsPromised.push(sliceScript(text, fileName, svelteAst.module.content, context));
  }

  const { walk } = await import('svelte/compiler');

  walk(svelteAst.html, {
    enter(node: any) {
      if (node.name === 'script' && node.children[0]) {
        const sourceText = node.children[0].data as string;
        const promise = context.parse(sourceText, fileName, AstFormat.JS).then((ast) => ({
          ast: {
            ...ast,
            offset: toOffset(node.children[0].start),
          },
          range: { start: node.children[0].start, end: node.children[0].end },
        }));
        additionalScriptsAsPromised.push(promise);
      }

      const bindingExpression = collectBindingExpression(node as BaseNode);
      if (bindingExpression) {
        const { start, end, loc } = bindingExpression as unknown as { start: number; end: number; loc: SourceLocation };
        const sourceText = text.substring(start, end);
        const promise = context.parse(sourceText, fileName, AstFormat.JS).then((ast) => ({
          ast: {
            ...ast,
            offset: toOffset(loc.start),
          },
          range: { start, end },
          expression: true,
        }));
        additionalScriptsAsPromised.push(promise);
      }
    },
  });

  return Promise.all(additionalScriptsAsPromised);
}

function collectBindingExpression(node: BaseNode): BaseNode | null {
  switch (node.type) {
    case 'MustacheTag':
    case 'IfBlock':
    case 'ConstTag':
    case 'EachBlock':
    case 'AwaitBlock':
    case 'KeyBlock':
      return (node as any).expression;
    case 'ArrowFunctionExpression':
      return (node as any).body;
    default:
      return null;
  }
}
function toOffset(start: Position): Offset {
  return {
    line: start.line - 1,
    position: start.column,
  };
}
