import {
  HtmlAst,
  AstFormat,
  HtmlRootNode,
  ScriptFormat,
  AstByFormat,
  Range,
  ScriptAst,
} from '../syntax/index.js';
import type { Ast as NGAst } from 'angular-html-parser';
import { ParserContext } from './parser-context.js';
import { ParseError } from './parse-error.js';

const TSX_SCRIPT_TYPES = Object.freeze(['tsx', 'text/tsx']);
const TS_SCRIPT_TYPES = Object.freeze(['ts', 'text/typescript', 'typescript']);
const JS_SCRIPT_TYPES = Object.freeze([
  'js',
  'text/javascript',
  'javascript',
  'module',
]);

/**
 * A parsed `<script>` block, together with what was declared on the tag.
 * `HtmlRootNode` only keeps the `ast`, the other fields are here for formats
 * that need to tell the blocks apart.
 */
export interface ScriptBlock {
  ast: ScriptAst;
  /** The tag carries a `setup` attribute */
  isSetup: boolean;
  /** The raw value of the `lang` attribute, when present */
  lang?: string;
  /** The range of the block's content inside the original text */
  range: Range;
}

/*
The parser implementation in this file is heavily based on prettier's html parser
https://github.com/prettier/prettier/blob/5a7162d0636a82c5862b9101b845af40918d22d1/src/language-html/parser-html.js
*/
export async function parse(
  text: string,
  originFileName: string,
  context: ParserContext,
): Promise<HtmlAst> {
  const scriptBlocks = await collectScriptBlocks(text, originFileName, context);
  const root: HtmlRootNode = {
    scripts: scriptBlocks.map(({ ast }) => ast),
  };

  return {
    originFileName,
    rawContent: text,
    format: AstFormat.Html,
    root,
  };
}

export async function collectScriptBlocks(
  text: string,
  fileName: string,
  parserContext: ParserContext,
): Promise<ScriptBlock[]> {
  const ngParser = await import('angular-html-parser');

  const { rootNodes, errors } = ngParser.parse(text, {
    canSelfClose: true,
    allowHtmComponentClosingTags: true,
    isTagNameCaseSensitive: true,
  });

  if (errors.length !== 0) {
    throw new ParseError(
      errors[0].msg,
      fileName,
      toSourceLocation(errors[0].span.start),
    );
  }
  const blocksAsPromised: Array<Promise<ScriptBlock>> = [];
  ngParser.visitAll(
    new (class extends ngParser.RecursiveVisitor {
      public override visitElement(el: NGAst.Element, context: unknown): void {
        const scriptFormat = getScriptType(el);
        if (scriptFormat) {
          blocksAsPromised.push(parseScriptBlock(el, scriptFormat));
        }
        super.visitElement(el, context);
      }
    })(),
    rootNodes,
  );
  return await Promise.all(blocksAsPromised);

  async function parseScriptBlock(
    el: NGAst.Element,
    scriptFormat: ScriptFormat,
  ): Promise<ScriptBlock> {
    return {
      ast: await parseScript(el, scriptFormat),
      isSetup: el.attrs.some((attr) => attr.name === 'setup'),
      lang: el.attrs.find((attr) => attr.name === 'lang')?.value,
      range: {
        start: el.startSourceSpan.end.offset,
        end: el.endSourceSpan!.start.offset,
      },
    };
  }

  async function parseScript<T extends ScriptFormat>(
    el: NGAst.Element,
    scriptFormat: T,
  ): Promise<AstByFormat[T]> {
    const content = text.substring(
      el.startSourceSpan.end.offset,
      el.endSourceSpan!.start.offset,
    );
    const ast = await parserContext.parse(content, fileName, scriptFormat);
    if (ast) {
      const offset = el.startSourceSpan.end;
      ast.root.start! += offset.offset;
      ast.root.end! += offset.offset;
      return {
        ...ast,
        offset: {
          column: offset.offset,
          line: offset.line,
        },
      };
    }
    return ast;
  }
}

function toSourceLocation({ line, col }: { line: number; col: number }): {
  line: number;
  column: number;
} {
  // Offset line with 1, since ngHtmlParser is 0-based
  return { line: line + 1, column: col };
}

function getScriptType(element: NGAst.Element): ScriptFormat | undefined {
  if (element.name === 'script') {
    const containsSrc = element.attrs.some((attr) => attr.name === 'src');
    if (!containsSrc) {
      const type =
        element.attrs.find((attr) => attr.name === 'type') ??
        element.attrs.find((attr) => attr.name === 'lang');
      if (type) {
        const typeToLower = type.value.toLowerCase();
        if (TSX_SCRIPT_TYPES.includes(typeToLower)) {
          return AstFormat.Tsx;
        }
        if (TS_SCRIPT_TYPES.includes(typeToLower)) {
          return AstFormat.TS;
        }
        if (JS_SCRIPT_TYPES.includes(typeToLower)) {
          return AstFormat.JS;
        }
      } else {
        return AstFormat.JS;
      }
    }
  }
  return undefined;
}
