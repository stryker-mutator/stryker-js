import { BaseNode, Program } from 'estree';
import { parse as svelteParse, walk } from 'svelte/compiler';
import { Ast as InternalSvelteAst, ConstTag, MustacheTag } from 'svelte/types/compiler/interfaces.js';

import { AstFormat, SvelteAst, SvelteRootNode, SvelteNode } from '../syntax/index.js';

import { ParserContext } from './parser-context.js';

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

  return {
    mainScript: mainScript,
    additionalScripts: additionalScripts,
  };
}

async function sliceScript(text: string, fileName: string, program: Program, context: ParserContext): Promise<SvelteNode> {
  const { start, end } = program as unknown as { start: number; end: number };
  const parsed = await context.parse(text.slice(start, end), fileName, AstFormat.JS);
  return { ast: parsed, range: { start, end } };
}

function getMainScript(ast: InternalSvelteAst, text: string, fileName: string, context: ParserContext): Promise<SvelteNode> {
  if (ast.instance?.content) {
    return sliceScript(text, fileName, ast.instance.content, context);
  } else {
    return sliceScript(text, fileName, ast.module!.content, context);
  }
}

function getAdditionalScripts(svelteAst: InternalSvelteAst, text: string, fileName: string, context: ParserContext): Promise<SvelteNode[]> {
  const additionalScriptsAsPromised: Array<Promise<SvelteNode>> = [];

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

      const bindingExpression = collectBindingExpression(node as BaseNode);
      if (bindingExpression) {
        const { start, end } = bindingExpression as unknown as { start: number; end: number };
        const promise = context.parse(text.substring(start, end), fileName, AstFormat.JS).then((ast) => ({
          ast,
          range: { start, end },
          expression: true,
        }));
        additionalScriptsAsPromised.push(promise);
      }
    },
  });

  return Promise.all(additionalScriptsAsPromised);
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
