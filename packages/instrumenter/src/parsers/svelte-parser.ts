import type { BaseNode, Node, Program } from 'estree';
import type { TemplateNode, Text } from 'svelte/types/compiler/interfaces';

import { AstFormat, SvelteAst, TemplateScript, SvelteRootNode } from '../syntax/index.js';
import { PositionConverter } from '../util/index.js';

import { ParserContext } from './parser-context.js';

interface Range {
  start: number;
  end: number;
}
interface TemplateRange extends Range {
  expression: boolean;
}
type RangedProgram = Program & Range;

export async function parse(text: string, fileName: string, context: ParserContext): Promise<SvelteAst> {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const { parse: svelteParse, walk } = await import('svelte/compiler');
  const svelteAst = svelteParse(text);

  const positionConverter = new PositionConverter(text);

  const [moduleScript, additionalScripts] = await Promise.all([getModuleScript(), getTemplateScripts()]);
  const root: SvelteRootNode = { moduleScript, additionalScripts };

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Svelte,
    root,
  };

  async function getModuleScript(): Promise<TemplateScript | undefined> {
    if (svelteAst.module) {
      const script = svelteAst.module.content as RangedProgram;
      return parseTemplateScript({ start: script.start, end: script.end, expression: false });
    }
    return;
  }

  async function getTemplateScripts(): Promise<TemplateScript[]> {
    const templateScripts: TemplateRange[] = [];

    if (svelteAst.instance) {
      const { start, end } = svelteAst.instance.content as RangedProgram;
      templateScripts.push({ start, end, expression: false });
    }

    walk(svelteAst.html as Node, {
      enter(n) {
        const node = n as TemplateNode;
        if (node.type === 'Element' && node.name === 'script' && node.children?.[0].type === 'Text') {
          const textContentNode = node.children[0] as Text;
          templateScripts.push({ start: textContentNode.start, end: textContentNode.end, expression: false });
        }

        const templateExpression = collectTemplateExpression(node);
        if (templateExpression) {
          const { start, end } = templateExpression;
          templateScripts.push({ start, end, expression: true });
        }
      },
    });

    return Promise.all(templateScripts.map((script) => parseTemplateScript(script)));
  }

  async function parseTemplateScript({ start, end, expression }: TemplateRange): Promise<TemplateScript> {
    const scriptText = text.slice(start, end);
    const parsed = await context.parse(scriptText, fileName, AstFormat.JS);
    return {
      ast: {
        ...parsed,
        offset: positionConverter.positionFromOffset(start),
      },
      range: { start, end },
      expression,
    };
  }

  function collectTemplateExpression(node: TemplateNode): (BaseNode & Range) | undefined {
    switch (node.type) {
      case 'MustacheTag':
      case 'RawMustacheTag':
      case 'IfBlock':
      case 'ConstTag':
      case 'EachBlock':
      case 'AwaitBlock':
      case 'KeyBlock':
      case 'EventHandler':
        return node.expression;
      default:
        return undefined;
    }
  }
}
