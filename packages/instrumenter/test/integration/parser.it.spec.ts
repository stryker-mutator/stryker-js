import { promises as fs } from 'fs';
import * as path from 'path';

import { expect } from 'chai';

import { parse } from '../../src/parsers';
import { AstFormat, HtmlAst, TSAst, JSAst } from '../../src/syntax';

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
    const actual = await actAssertHtml('index.html');
    expect(actual.root.scripts).lengthOf(2);
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a *.vue file', async () => {
    const actual = await actAssertHtml('App.vue');
    expect(actual.format).eq(AstFormat.Html);
    expect(actual.root.scripts).lengthOf(1);
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a piece of angular code', async () => {
    const actual = await actAssertTS('app.component.ts');
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a piece of react code', async () => {
    const actual = await actAssertJS('Badge.js');
    expect(actual).to.matchSnapshot();
  });

  async function act(testResourceFileName: string) {
    const input = await fs.readFile(resolveTestResource(testResourceFileName), 'utf8');
    const actual = await parse(input, testResourceFileName);
    return actual;
  }
  async function actAssertHtml(testResourceFileName: string): Promise<HtmlAst> {
    const actual = await act(testResourceFileName);
    expect(actual.format).eq(AstFormat.Html);
    return actual as HtmlAst;
  }
  async function actAssertTS(testResourceFileName: string): Promise<TSAst> {
    const actual = await act(testResourceFileName);
    expect(actual.format).eq(AstFormat.TS);
    return actual as TSAst;
  }
  async function actAssertJS(testResourceFileName: string): Promise<JSAst> {
    const actual = await act(testResourceFileName);
    expect(actual.format).eq(AstFormat.JS);
    return actual as JSAst;
  }
});
