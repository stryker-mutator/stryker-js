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
interface TemplateRange extends Range {
  isExpression: boolean;
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const templateExpression = collectTemplateExpression(node);
        if (templateExpression) {
          const { start, end } = templateExpression;
          ranges.push({ start, end, isExpression: true });
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
  }: TemplateScriptRange): Promise<TemplateScript> {
    const scriptText = text.slice(start, end);
    const parsed = await context.parse(scriptText, fileName, format);
    return {
      ast: {
        ...parsed,
        offset: positionConverter.positionFromOffset(start),
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
      // Template script is always JS
      return {
        start,
        end: start + script.length,
        isExpression: range.isExpression,
        format: AstFormat.JS,
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

function collectTemplateExpression(node: {
  type: string;
  expression: BaseNode & Range;
}): (BaseNode & Range) | undefined {
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
