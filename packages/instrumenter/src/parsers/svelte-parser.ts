import type { BaseNode, Program } from 'estree';
import type { AST } from 'svelte/compiler';

import { notEmpty } from '@stryker-mutator/util';

import { satisfies } from 'semver';

import {
  AstFormat,
  SvelteAst,
  TemplateScript,
  SvelteRootNode,
} from '../syntax/index.js';
import { PositionConverter } from '../util/index.js';

import { ParserContext } from './parser-context.js';

interface Range {
  start: number;
  end: number;
}
interface RangedNode extends BaseNode, Range {
  [key: string]: unknown;
}
interface TemplateRange extends Range {
  isExpression: boolean;
  parenthesized?: boolean;
}

interface TemplateScriptRange extends TemplateRange {
  format: AstFormat.JS | AstFormat.TS;
}

interface ScriptTag {
  content: string;
  attributes: Record<string, boolean | string>;
}

type RangedProgram = Program & Range;
const MIN_SVELTE_VERSION = '>=3.30';
export async function parse(
  text: string,
  fileName: string,
  context: ParserContext,
): Promise<SvelteAst> {
  const {
    parse: svelteParse,
    preprocess,
    VERSION,
  } = await import('svelte/compiler');
  let walk: typeof import('estree-walker').walk;

  if (!satisfies(VERSION, MIN_SVELTE_VERSION)) {
    throw new Error(
      `Svelte version ${VERSION} not supported. Expected: ${MIN_SVELTE_VERSION} (processing file ${fileName})`,
    );
  }
  /*
    Allow instrumentation of Svelte 5 projects without dropping support for Svelte 4.
    Due to the way Svelte 5 is structured, we can no longer use the typings from Svelte 4, even though
    we use the legacy AST. The full Svelte 5 migration should update these typings to use the new AST.
  */
  if (satisfies(VERSION, '>=5')) {
    ({ walk } = await import(
      import.meta.resolve('estree-walker', import.meta.resolve('svelte'))
    ));
  } else {
    // Svelte 4
    ({ walk } = await import('svelte/compiler'));
  }

  const positionConverter = new PositionConverter(text);
  const { replacedCode, scriptMap } = await replaceScripts(text);
  const svelteAst = svelteParse(replacedCode, { filename: fileName });

  const moduleScriptRange = getModuleScriptRange(svelteAst);
  const templateRanges = getTemplateScriptRanges(svelteAst);
  const { remappedModuleScriptRange, remappedScriptRanges } =
    remapScriptLocations(
      replacedCode,
      scriptMap,
      moduleScriptRange,
      templateRanges,
    );

  const [moduleScript, ...additionalScripts] = await Promise.all([
    parseTemplateScriptIfDefined(remappedModuleScriptRange),
    ...remappedScriptRanges.map(parseTemplateScript),
  ]);
  const root: SvelteRootNode = { moduleScript, additionalScripts };

  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.Svelte,
    root,
  };

  /**
   * Replaces script tags with placeholders.
   * This is needed, because svelte's `parse` doesn't support `lang="ts"`.
   */
  async function replaceScripts(code: string) {
    const map = new Map<string, ScriptTag>();
    let scriptIndex = 0;
    const result = await preprocess(code, {
      script(script) {
        const scriptName = `script${scriptIndex++}`;
        map.set(scriptName, script);
        return { code: scriptName };
      },
    });
    return { replacedCode: result.code, scriptMap: map };
  }

  function getTemplateScriptRanges(ast: Record<string, any>): TemplateRange[] {
    const ranges: TemplateRange[] = [];

    if (ast.instance) {
      const { start, end } = ast.instance.content as RangedProgram;
      ranges.push({ start, end, isExpression: false });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    walk(ast.html, {
      enter(n) {
        const node = n as any;
        if (
          node.type === 'Element' &&
          node.name === 'script' &&
          node.children?.[0].type === 'Text'
        ) {
          const textContentNode = node.children[0] as AST.Text;
          ranges.push({
            start: textContentNode.start,
            end: textContentNode.end,
            isExpression: false,
          });
        }

        for (const templateExpression of collectTemplateExpressions(node)) {
          const { start, end } = templateExpression;
          ranges.push({
            start,
            end,
            isExpression: true,
            parenthesized: [
              'ObjectExpression',
              'FunctionExpression',
              'ClassExpression',
            ].includes(templateExpression.type),
          });
        }
      },
    });

    return ranges;
  }

  async function parseTemplateScriptIfDefined(
    range?: TemplateScriptRange,
  ): Promise<TemplateScript | undefined> {
    if (range) {
      return parseTemplateScript(range);
    }
    return;
  }
  async function parseTemplateScript({
    start,
    end,
    isExpression,
    format,
    parenthesized,
  }: TemplateScriptRange): Promise<TemplateScript> {
    const scriptText = text.slice(start, end);
    const parsed = await context.parse(
      parenthesized ? `(${scriptText})` : scriptText,
      fileName,
      format,
    );
    const offset = positionConverter.positionFromOffset(start);
    return {
      ast: {
        ...parsed,
        offset: {
          line: offset.line,
          column: offset.column - (parenthesized ? 1 : 0),
        },
      },
      range: { start, end },
      isExpression,
    };
  }
}

function getModuleScriptRange(
  svelteAst: Record<string, any>,
): TemplateRange | undefined {
  if (svelteAst.module) {
    const script = svelteAst.module.content as RangedProgram;
    return { start: script.start, end: script.end, isExpression: false };
  }
  return;
}

/**
 * Remaps script locations back to the original places using the script map
 */
function remapScriptLocations(
  code: string,
  scriptMap: Map<string, ScriptTag>,
  moduleScriptRange: TemplateRange | undefined,
  templateRanges: TemplateRange[],
): {
  remappedModuleScriptRange: TemplateScriptRange | undefined;
  remappedScriptRanges: TemplateScriptRange[];
} {
  const scriptRanges = [moduleScriptRange, ...templateRanges]
    .filter(notEmpty)
    .sort((a, b) => a.start - b.start);
  const expressionFormat = [...scriptMap.values()].some(
    (s) => s.attributes.lang === 'ts',
  )
    ? AstFormat.TS
    : AstFormat.JS;
  let offset = 0;
  let newModuleScriptRange: TemplateScriptRange | undefined;
  const newScriptRanges: TemplateScriptRange[] = scriptRanges.map((range) => {
    const script = code.substring(range.start, range.end);
    const actualScript = scriptMap.get(script);
    const start = range.start + offset;
    if (actualScript) {
      const scriptRange: TemplateScriptRange = {
        start,
        end: start + actualScript.content.length,
        isExpression: range.isExpression,
        format:
          actualScript.attributes.lang === 'ts' ? AstFormat.TS : AstFormat.JS,
      };
      offset += actualScript.content.length - script.length;
      if (range === moduleScriptRange) {
        newModuleScriptRange = scriptRange;
      }
      return scriptRange;
    } else {
      // Template expressions use the same format as the file's script lang
      return {
        ...range,
        start,
        end: start + script.length,
        isExpression: range.isExpression,
        format: range.isExpression ? expressionFormat : AstFormat.JS,
      };
    }
  });
  return {
    remappedModuleScriptRange: newModuleScriptRange,
    remappedScriptRanges: newScriptRanges.filter(
      (range) => range !== newModuleScriptRange,
    ),
  };
}

function isRangedNode(value: unknown): value is RangedNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string' &&
    'start' in value &&
    typeof value.start === 'number' &&
    'end' in value &&
    typeof value.end === 'number'
  );
}

function collectTemplateExpressions(node: unknown): RangedNode[] {
  if (!isRangedNode(node)) return [];
  switch (node.type) {
    case 'MustacheTag':
    case 'RawMustacheTag':
    case 'IfBlock':
    case 'ConstTag':
    case 'EachBlock':
    case 'AwaitBlock':
    case 'KeyBlock':
    case 'EventHandler':
      return [node.expression].filter(isRangedNode);
    case 'RenderTag': {
      const expression = node.expression;
      if (!isRangedNode(expression)) return [];
      const call =
        expression.type === 'ChainExpression'
          ? expression.expression
          : expression;
      if (!isRangedNode(call) || call.type !== 'CallExpression') return [];
      return [
        call.callee,
        ...(Array.isArray(call.arguments) ? call.arguments : []),
      ].filter(isRangedNode);
    }
    case 'SnippetBlock':
      return Array.isArray(node.parameters)
        ? node.parameters.flatMap(collectParameterExpressions)
        : [];
    default:
      return [];
  }
}

function collectParameterExpressions(node: unknown): RangedNode[] {
  if (!isRangedNode(node)) return [];
  switch (node.type) {
    case 'AssignmentPattern':
      return [node.right]
        .filter(isRangedNode)
        .concat(collectParameterExpressions(node.left));
    case 'ArrayPattern':
      return Array.isArray(node.elements)
        ? node.elements.flatMap(collectParameterExpressions)
        : [];
    case 'ObjectPattern':
      return Array.isArray(node.properties)
        ? node.properties.flatMap((property: unknown): RangedNode[] => {
            if (!isRangedNode(property)) return [];
            if (property.type === 'RestElement') {
              return collectParameterExpressions(property.argument);
            }
            return [
              ...(property.computed ? [property.key].filter(isRangedNode) : []),
              ...collectParameterExpressions(property.value),
            ];
          })
        : [];
    default:
      return [];
  }
}
