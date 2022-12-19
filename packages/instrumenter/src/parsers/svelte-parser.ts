import { Program } from 'estree';
import { parse as svelteParse, walk } from 'svelte/compiler';

import { Ast } from 'svelte/types/compiler/interfaces.js';

import { AstFormat, SvelteAst, SvelteRootNode, SvelteScriptTag } from '../syntax/index.js';

import { ParserContext } from './parser-context.js';

export async function parse(text: string, fileName: string, context: ParserContext): Promise<SvelteAst> {
  const ast = svelteParse(text);

  const root = await astParse(ast, text, context);

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Svelte,
    root: root,
  };
}

async function astParse(root: Ast, text: string, context: ParserContext): Promise<SvelteRootNode> {
  const mainScript = await getMainScript(root, text, context);
  const additionalScripts = await getAdditionalScripts(root, text, context);

  return {
    mainScript: mainScript,
    additionalScripts: additionalScripts,
  };
}

async function sliceScript(text: string, program: Program, context: ParserContext): Promise<SvelteScriptTag> {
  const { start, end } = program as unknown as { start: number; end: number };
  const parsed = await context.parse(text.slice(start, end), '', AstFormat.JS);
  return { ast: parsed, range: { start, end } };
}

function getMainScript(ast: Ast, text: string, context: ParserContext): Promise<SvelteScriptTag | undefined> {
  if (ast.instance?.content) {
    return sliceScript(text, ast.instance.content, context);
  } else if (ast.module?.content) {
    return sliceScript(text, ast.module.content, context);
  }

  return Promise.resolve(undefined);
}

async function getAdditionalScripts(ast: Ast, text: string, context: ParserContext): Promise<SvelteScriptTag[]> {
  const additionalScripts: SvelteScriptTag[] = [];

  if (ast.instance?.content && ast.module?.content) {
    additionalScripts.push(await sliceScript(text, ast.module.content, context));
  }

  const htmlScript: any = [];
  walk(ast.html, {
    enter(node: any) {
      if (node.name === 'script' && node.children[0]) {
        htmlScript.push(node);
      }
    },
  });

  for (const node of htmlScript) {
    const parsed = await context.parse(node.children[0].data as string, '', AstFormat.JS);
    additionalScripts.push({ ast: parsed, range: { start: node.children[0].start, end: node.children[0].end } });
  }

  return additionalScripts;
}
