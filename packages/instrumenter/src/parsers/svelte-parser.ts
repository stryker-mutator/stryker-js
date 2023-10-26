import type { BaseNode, Node, Program } from 'estree';
import type { TemplateNode, Text } from 'svelte/types/compiler/interfaces';

import { AstFormat, SvelteAst, SvelteNode } from '../syntax/index.js';
import { PositionConverter } from '../util/index.js';

import { ParserContext } from './parser-context.js';

const header = '<script></script>\n\n';

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
  const { parse: svelteParse } = await import('svelte/compiler');
  let svelteAst = svelteParse(text);

  if (!svelteAst.instance && !svelteAst.module) {
    text = header + text;
    svelteAst = svelteParse(text);
  }
  const positionConverter = new PositionConverter(text);

  const mainScript = await getMainScript();
  const additionalScripts = await getTemplateScripts();

  const root = { mainScript, additionalScripts };

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Svelte,
    root: root,
  };

  async function parseTemplateScript({ start, end, expression }: TemplateRange): Promise<SvelteNode> {
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

  function getMainScript(): Promise<SvelteNode> {
    let script: RangedProgram;
    if (svelteAst.instance?.content) {
      script = svelteAst.instance.content as RangedProgram;
    } else {
      script = svelteAst.module!.content as RangedProgram;
    }
    return parseTemplateScript({ start: script.start, end: script.end, expression: false });
  }

  async function getTemplateScripts(): Promise<SvelteNode[]> {
    const additionalScriptsAsPromised: Array<Promise<SvelteNode>> = [];

    if (svelteAst.instance?.content && svelteAst.module?.content) {
      const { start, end } = svelteAst.module.content as RangedProgram;
      additionalScriptsAsPromised.push(parseTemplateScript({ start, end, expression: false }));
    }

    // eslint-disable-next-line import/no-extraneous-dependencies
    const { walk } = await import('svelte/compiler');

    const templateScripts: TemplateRange[] = [];

    walk(svelteAst.html as Node, {
      enter(n) {
        const node = n as TemplateNode;
        if (node.type === 'Element' && node.name === 'script' && node.children?.[0].type === 'Text') {
          const textContentNode = node.children[0] as Text;
          templateScripts.push({ start: textContentNode.start, end: textContentNode.end, expression: false });
        }

        const templateExpression = collectTemplateExpression(node as BaseNode);
        if (templateExpression) {
          const { start, end } = templateExpression as BaseNode & Range;
          templateScripts.push({ start, end, expression: true });
        }
      },
    });

    return Promise.all([...additionalScriptsAsPromised, ...templateScripts.map((script) => parseTemplateScript(script))]);
  }

  function collectTemplateExpression(node: BaseNode): BaseNode | undefined {
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
        return undefined;
    }
  }
}
