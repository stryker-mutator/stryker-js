import { Program } from 'estree';
import { parse as svelteParse, walk } from 'svelte/compiler';

import { Ast } from 'svelte/types/compiler/interfaces.js';

import { AstFormat, SvelteAst, SvelteRootNode } from '../syntax/index.js';

import { ParserContext } from './parser-context.js';

interface SvelteScriptTag {
  content: string;
  range: Range;
}

interface Range {
  start: number;
  end: number;
}

export async function parse(text: string, fileName: string, context: ParserContext): Promise<SvelteAst> {
  const ast = svelteParse(text);

  const rootScripts = { mainScript: getMainScript(ast, text), additionalScripts: getAdditionalScripts(ast, text) };

  const root = await rootParse(rootScripts, fileName, context);

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Svelte,
    root: root,
  };
}

async function rootParse(root, fileName, context): Promise<SvelteRootNode> {
  if (root.mainScript) {
    const mainScriptAst = await context.parse(root.mainScript.content, fileName, AstFormat.JS);
    mainScriptAst.root.start = root.mainScript.range.start;
    mainScriptAst.root.end = root.mainScript.range.end;
    root.mainScript = mainScriptAst;
  }

  if (root.additionalScripts) {
    root.additionalScripts = await Promise.all(
      root.additionalScripts.map(async (script) => {
        const scriptAst = await context.parse(script.content, fileName, AstFormat.JS);
        scriptAst.root.start = script.range.start;
        scriptAst.root.end = script.range.end;
        return scriptAst;
      })
    );
  }

  return root;
}

function getMainScript(ast: Ast, text: string) {
  if (ast.instance?.content) {
    return sliceContent(text, ast.instance.content);
  } else if (ast.module?.content) {
    return sliceContent(text, ast.module.content);
  }
  return undefined;
}

function sliceContent(text: string, program: Program): SvelteScriptTag {
  const { start, end } = program as unknown as { start: number; end: number };
  return { content: text.slice(start, end), range: { start, end } };
}

function getAdditionalScripts(ast: Ast, text: string): SvelteScriptTag[] {
  const additionalScripts: SvelteScriptTag[] = [];

  if (ast.instance?.content && ast.module?.content) {
    additionalScripts.push(sliceContent(text, ast.module.content));
  }

  walk(ast.html, {
    enter(node) {
      if (node.name === 'script' && node.children[0]) {
        additionalScripts.push({ content: node.children[0].data, range: { start: node.children[0].start, end: node.children[0].end } });
      }
    },
  });
  return additionalScripts;
}
