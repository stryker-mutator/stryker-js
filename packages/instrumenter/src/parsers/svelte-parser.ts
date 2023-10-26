import type { BaseNode, Node, Position, Program } from 'estree';
import type { TemplateNode, Text } from 'svelte/types/compiler/interfaces';

import { AstFormat, SvelteAst, SvelteRootNode, SvelteNode } from '../syntax/index.js';
import { PositionConverter } from '../util/index.js';

import { ParserContext } from './parser-context.js';

const header = '<script></script>\n\n';

type ProgramWithLocation = Program & { start: number; end: number };

export async function parse(text: string, fileName: string, context: ParserContext): Promise<SvelteAst> {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const { parse: svelteParse } = await import('svelte/compiler');
  let svelteAst = svelteParse(text);

  if (!svelteAst.instance && !svelteAst.module) {
    text = header + text;
    svelteAst = svelteParse(text);
  }
  const positionConverter = new PositionConverter(text);

  const root = await astParse();

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Svelte,
    root: root,
  };

  async function astParse(): Promise<SvelteRootNode> {
    const mainScript = await getMainScript();
    const additionalScripts = await getAdditionalScripts();

    return { mainScript, additionalScripts };
  }

  async function sliceScript({ start, end }: { start: number; end: number }): Promise<SvelteNode> {
    const scriptText = text.slice(start, end);
    const parsed = await context.parse(scriptText, fileName, AstFormat.JS);
    return {
      ast: {
        ...parsed,
        offset: positionConverter.positionFromOffset(start),
      },
      range: { start, end },
    };
  }

  function getMainScript(): Promise<SvelteNode> {
    if (svelteAst.instance?.content) {
      return sliceScript(svelteAst.instance.content as ProgramWithLocation);
    } else {
      return sliceScript(svelteAst.module!.content as ProgramWithLocation);
    }
  }

  async function getAdditionalScripts(): Promise<SvelteNode[]> {
    const additionalScriptsAsPromised: Array<Promise<SvelteNode>> = [];

    if (svelteAst.instance?.content && svelteAst.module?.content) {
      additionalScriptsAsPromised.push(sliceScript(svelteAst.module.content as ProgramWithLocation));
    }

    // eslint-disable-next-line import/no-extraneous-dependencies
    const { walk } = await import('svelte/compiler');

    walk(svelteAst.html as Node, {
      enter(n) {
        const node = n as TemplateNode;
        if (node.type === 'Element' && node.name === 'script' && node.children?.[0].type === 'Text') {
          const textContentNode = node.children[0] as Text;
          const sourceText = textContentNode.data;
          const promise = context.parse(sourceText, fileName, AstFormat.JS).then((ast) => ({
            ast: {
              ...ast,
              offset: positionConverter.positionFromOffset(textContentNode.start),
            },
            range: { start: textContentNode.start, end: textContentNode.end },
          }));
          additionalScriptsAsPromised.push(promise);
        }

        const bindingExpression = collectBindingExpression(node as BaseNode);
        if (bindingExpression) {
          const { start, end, loc } = bindingExpression as BaseNode & { start: number; end: number };
          const sourceText = text.substring(start, end);
          const promise = context.parse(sourceText, fileName, AstFormat.JS).then((ast) => ({
            ast: {
              ...ast,
              offset: toStrykerPosition(loc!.start),
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
  function toStrykerPosition(start: Position): Position {
    return {
      // Svelte compiler is 1-based, stryker works with 0-based internally
      line: start.line - 1,
      column: start.column,
    };
  }
}
