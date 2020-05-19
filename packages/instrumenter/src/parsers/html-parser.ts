import type { Element } from 'angular-html-parser/lib/compiler/src/ml_parser/ast';
import type { ParseLocation } from 'angular-html-parser/lib/compiler/src/parse_util';

import { offsetLocations } from '../util/syntax-helpers';
import { HtmlAst, AstFormat, HtmlRootNode, TSAst, JSAst, ScriptFormat, AstByFormat } from '../syntax';

import { ParserContext } from './parser-context';
import { ParseError } from './parse-error';

const TS_SCRIPT_TYPES = Object.freeze(['ts', 'text/typescript', 'typescript']);
const JS_SCRIPT_TYPES = Object.freeze(['js', 'text/javascript', 'javascript']);

/*
The parser implementation in this file is heavily based on prettier's html parser
https://github.com/prettier/prettier/blob/5a7162d0636a82c5862b9101b845af40918d22d1/src/language-html/parser-html.js
*/

export async function parse(text: string, originFileName: string, context: ParserContext): Promise<HtmlAst> {
  const root = await ngHtmlParser(text, originFileName, context);

  return {
    originFileName,
    rawContent: text,
    format: AstFormat.Html,
    root,
  };
}

async function ngHtmlParser(text: string, fileName: string, parserContext: ParserContext): Promise<HtmlRootNode> {
  const { parse } = await import('angular-html-parser');
  const { RecursiveVisitor, visitAll } = await import('angular-html-parser/lib/compiler/src/ml_parser/ast');

  const { rootNodes, errors } = parse(text, {
    canSelfClose: true,
    allowHtmComponentClosingTags: true,
    isTagNameCaseSensitive: true,
  });

  if (errors.length !== 0) {
    throw new ParseError(errors[0].msg, fileName, toSourceLocation(errors[0].span.start));
  }
  const scriptsAsPromised: Array<Promise<JSAst | TSAst>> = [];
  visitAll(
    new (class extends RecursiveVisitor {
      public visitElement(el: Element, context: unknown): void {
        const scriptFormat = getScriptType(el);
        if (scriptFormat) {
          scriptsAsPromised.push(parseScript(el, scriptFormat));
        }
        super.visitElement(el, context);
      }
    })(),
    rootNodes
  );
  const scripts = await Promise.all(scriptsAsPromised);
  const root: HtmlRootNode = {
    scripts,
  };

  return root;

  async function parseScript<T extends ScriptFormat>(el: Element, scriptFormat: T): Promise<AstByFormat[T]> {
    const content = text.substring(el.startSourceSpan!.end.offset, el.endSourceSpan!.start.offset);
    const ast = await parserContext.parse(content, fileName, scriptFormat);
    if (ast) {
      const offset = el.startSourceSpan!.end;
      offsetLocations(ast.root, {
        position: offset.offset,
        column: offset.col,
        line: offset.line + 1, // need to add 1, since ngHtmlParser lines start with 0
      });
    }
    return ast;
  }
}

function toSourceLocation({ line, col }: ParseLocation): { line: number; column: number } {
  // Offset line with 1, since ngHtmlParser is 0-based
  return { line: line + 1, column: col };
}

function getScriptType(element: Element): ScriptFormat | undefined {
  if (element.name === 'script') {
    const containsSrc = element.attrs.some((attr) => attr.name === 'src');
    if (!containsSrc) {
      const type = element.attrs.find((attr) => attr.name === 'type');
      if (type) {
        const typeToLower = type.value.toLowerCase();
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
