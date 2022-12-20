import { Program } from 'estree';
import { parse as svelteParse, walk } from 'svelte/compiler';
import { Ast as InternalSvelteAst } from 'svelte/types/compiler/interfaces.js';

import { AstFormat, SvelteAst, SvelteRootNode, SvelteScriptTag } from '../syntax/index.js';

import { ParserContext } from './parser-context.js';

export async function parse(text: string, fileName: string, context: ParserContext): Promise<SvelteAst> {
  const ast = svelteParse(text);

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

async function sliceScript(text: string, fileName: string, program: Program, context: ParserContext): Promise<SvelteScriptTag> {
  const { start, end } = program as unknown as { start: number; end: number };
  const parsed = await context.parse(text.slice(start, end), fileName, AstFormat.JS);
  return { ast: parsed, range: { start, end } };
}

function getMainScript(ast: InternalSvelteAst, text: string, fileName: string, context: ParserContext): Promise<SvelteScriptTag | undefined> {
  if (ast.instance?.content) {
    return sliceScript(text, fileName, ast.instance.content, context);
  } else if (ast.module?.content) {
    return sliceScript(text, fileName, ast.module.content, context);
  }

  return Promise.resolve(undefined);
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
