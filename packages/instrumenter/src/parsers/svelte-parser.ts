import { Program } from 'estree';
import { parse as svelteParse, walk } from 'svelte/compiler';
import { Ast } from 'svelte/types/compiler/interfaces.js';

import { AstFormat, SvelteAst } from '../syntax/index.js';

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

  const scripts: SvelteScriptTag[] = getAllHtmlScripts(ast);

  if (ast.instance?.content) {
    scripts.push(sliceContent(text, ast.instance.content));
  }
  if (ast.module?.content) {
    scripts.push(sliceContent(text, ast.module.content));
  }

  const rootScripts = await Promise.all(
    scripts.map(async (script) => {
      const scriptAst = await context.parse(script.content, fileName, AstFormat.JS);
      scriptAst.root.start = script.range.start;
      scriptAst.root.end = script.range.end;
      return scriptAst;
    })
  );

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Svelte,
    root: { scripts: rootScripts },
  };
}

function sliceContent(text: string, program: Program): SvelteScriptTag {
  const { start, end } = program as unknown as { start: number; end: number };
  return { content: text.slice(start, end), range: { start, end } };
}

function getAllHtmlScripts(ast: Ast): SvelteScriptTag[] {
  const templateScripts: SvelteScriptTag[] = [];

  walk(ast.html, {
    enter(node) {
      if (node.name === 'script' && node.children[0]) {
        templateScripts.push({ content: node.children[0].data, range: { start: node.children[0].start, end: node.children[0].end } });
      }
    },
  });
  return templateScripts;
}
