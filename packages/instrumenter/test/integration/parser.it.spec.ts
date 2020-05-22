import { promises as fs } from 'fs';
import * as path from 'path';

import { expect } from 'chai';

import { parse } from '../../src/parsers';
import { AstFormat, HtmlAst } from '../../src/syntax';

const resolveTestResource = path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'parser'
) as typeof path.resolve;

describe('parser integration', () => {
  it('should allow to parse html with script tags', async () => {
    const input = await fs.readFile(resolveTestResource('index.html'), 'utf8');
    const actual = (await parse(input, 'index.html')) as HtmlAst;
    expect(actual.format).eq(AstFormat.Html);
    expect(actual.root.scripts).lengthOf(2);
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a *.vue file', async () => {
    const input = await fs.readFile(resolveTestResource('App.vue'), 'utf8');
    const actual = (await parse(input, 'App.vue')) as HtmlAst;
    expect(actual.format).eq(AstFormat.Html);
    expect(actual.root.scripts).lengthOf(1);
    expect(actual).to.matchSnapshot();
  });
});
