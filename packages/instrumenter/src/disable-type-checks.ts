import { types } from '@babel/core';
import { File } from '@stryker-mutator/api/core';
import { notEmpty } from '@stryker-mutator/util';

import { createParser, getFormat, ParserOptions } from './parsers';
import { AstFormat, HtmlAst, ScriptAst } from './syntax';

const commentDirectiveRegEx = /^(\s*)@(ts-[a-z-]+).*$/;
const tsDirectiveLikeRegEx = /@(ts-[a-z-]+)/;
const startingCommentRegex = /(^\s*\/\*.*?\*\/)/gs;

export async function disableTypeChecks(file: File, options: ParserOptions): Promise<File> {
  if (isJSFileWithoutTSDirectives(file)) {
    // Performance optimization. Only parse the file when it has a change of containing a `// @ts-` directive
    return new File(file.name, prefixWithNoCheck(file.textContent));
  }
  const parse = createParser(options);
  const ast = await parse(file.textContent, file.name);
  switch (ast.format) {
    case AstFormat.JS:
    case AstFormat.TS:
    case AstFormat.Tsx:
      return new File(file.name, disableTypeCheckingInBabelAst(ast));
    case AstFormat.Html:
      return new File(file.name, disableTypeCheckingInHtml(ast));
  }
}

function isJSFileWithoutTSDirectives(file: File) {
  const format = getFormat(file.name);
  return (format === AstFormat.TS || format === AstFormat.JS) && !tsDirectiveLikeRegEx.test(file.textContent);
}

function disableTypeCheckingInBabelAst(ast: ScriptAst): string {
  return prefixWithNoCheck(removeTSDirectives(ast.rawContent, ast.root.comments));
}

function prefixWithNoCheck(code: string): string {
  if (code.startsWith('#')) {
    // first line has a shebang (#!/usr/bin/env node)
    const newLineIndex = code.indexOf('\n');
    if (newLineIndex > 0) {
      return `${code.substr(0, newLineIndex)}\n// @ts-nocheck\n${code.substr(newLineIndex + 1)}`;
    } else {
      return code;
    }
  } else {
    // We should leave comments, like `/** @jest-env jsdom */ at the top of the file, see #2569
    const commentMatch = startingCommentRegex.exec(code);
    return `${commentMatch?.[1].concat('\n') ?? ''}// @ts-nocheck\n${code.substr(commentMatch?.[1].length ?? 0)}`;
  }
}

function disableTypeCheckingInHtml(ast: HtmlAst): string {
  const sortedScripts = [...ast.root.scripts].sort((a, b) => a.root.start! - b.root.start!);
  let currentIndex = 0;
  let html = '';
  for (const script of sortedScripts) {
    html += ast.rawContent.substring(currentIndex, script.root.start!);
    html += '\n';
    html += prefixWithNoCheck(removeTSDirectives(script.rawContent, script.root.comments));
    html += '\n';
    currentIndex = script.root.end!;
  }
  html += ast.rawContent.substr(currentIndex);
  return html;
}

function removeTSDirectives(text: string, comments: Array<types.CommentBlock | types.CommentLine> | null | undefined): string {
  const directiveRanges = comments
    ?.map(tryParseTSDirective)
    .filter(notEmpty)
    .sort((a, b) => a.startPos - b.startPos);
  if (directiveRanges) {
    let currentIndex = 0;
    let pruned = '';
    for (const directiveRange of directiveRanges) {
      pruned += text.substring(currentIndex, directiveRange.startPos);
      currentIndex = directiveRange.endPos;
    }
    pruned += text.substr(currentIndex);
    return pruned;
  } else {
    return text;
  }
}

function tryParseTSDirective(comment: types.CommentBlock | types.CommentLine): { startPos: number; endPos: number } | undefined {
  const match = commentDirectiveRegEx.exec(comment.value);
  if (match) {
    const directiveStartPos = comment.start + match[1].length + 2; // +2 to account for the `//` or `/*` start character
    return { startPos: directiveStartPos, endPos: directiveStartPos + match[2].length + 1 };
  }
  return undefined;
}
