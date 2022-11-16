import { Program } from 'estree';
import { parse as parseSvelte, walk } from 'svelte/compiler';
import { Ast } from 'svelte/types/compiler/interfaces.js';

import { AstFormat, SvelteAst } from '../syntax/index.js';

import { ParserContext } from './parser-context.js';

// TODO: better name
interface SvelteScript {
  content: string;
  startEnd: StartEnd;
}

// TODO: better name
export interface StartEnd {
  start: number;
  end: number;
}

export async function parse(text: string, fileName: string, context: ParserContext): Promise<SvelteAst> {
  const ast = parseSvelte(text);

  const scripts: SvelteScript[] = getAllHtmlScripts(ast);

  if (ast.instance?.content) {
    scripts.push(sliceContent(text, ast.instance.content));
  }
  if (ast.module?.content) {
    scripts.push(sliceContent(text, ast.module.content));
  }

  const rootScripts = await Promise.all(
    scripts.map(async (script) => {
      const scriptAst = await context.parse(script.content, fileName, AstFormat.JS);
      scriptAst.root.start = script.startEnd.start;
      scriptAst.root.end = script.startEnd.end;
      return scriptAst;
    })
  );

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Svelte,
    root: { rootScripts: rootScripts },
  };
}

function sliceContent(text: string, program: Program): SvelteScript {
  const { start, end } = program as unknown as { start: number; end: number };
  return { content: text.slice(start, end), startEnd: { start, end } };
}

function getAllHtmlScripts(ast: Ast): SvelteScript[] {
  const templateScripts: SvelteScript[] = [];

  walk(ast.html, {
    enter(node) {
      if (node.name === 'script' && node.children[0]) {
        templateScripts.push({ content: node.children[0].data, startEnd: { start: node.children[0].start, end: node.children[0].end } });
      }
    },
  });
  return templateScripts;
}
