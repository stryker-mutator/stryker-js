import { types } from '@babel/core';
import { File, Range } from '@stryker-mutator/api/core';
import { notEmpty } from '@stryker-mutator/util';

import { InstrumenterOptions } from './instrumenter-options';
import { createParser } from './parsers';
import { AstFormat } from './syntax';

export async function disableTypeChecking(file: File, options: InstrumenterOptions) {
  const parse = createParser(options);
  const ast = await parse(file.textContent, file.name);
  switch (ast.format) {
    case AstFormat.JS:
    case AstFormat.TS:
      return new File(file.name, `// @ts-nocheck\n${removeTSDirectives(file.textContent, ast.root.comments)}`);
  }
  return file;
}

function removeTSDirectives(text: string, comments: Array<types.CommentBlock | types.CommentLine> | null): string {
  const directiveRanges = comments
    ?.map(tryParseTSDirective)
    .filter(notEmpty)
    .sort((a, b) => a[0] - b[0]);
  if (directiveRanges) {
    let currentIndex = 0;
    let pruned = '';
    for (const directiveRange of directiveRanges) {
      pruned += text.substring(currentIndex, directiveRange[0]);
      currentIndex = directiveRange[1];
    }
    pruned += text.substr(currentIndex);
    return pruned;
  } else {
    return text;
  }
}

function tryParseTSDirective(comment: types.CommentBlock | types.CommentLine): Range | undefined {
  const commentDirectiveRegEx = /^(\s*)@(ts-[a-z-]+).*$/;
  const match = commentDirectiveRegEx.exec(comment.value);
  if (match) {
    const directiveStartPos = comment.start + match[1].length + 2; // +2 to account for the `//` or `/*` start character
    return [directiveStartPos, directiveStartPos + match[2].length + 1];
  }
  return undefined;
}
