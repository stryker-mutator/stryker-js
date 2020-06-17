import path from 'path';
import { promises as fs } from 'fs';

import { normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';

import { parse } from '../../src/parsers';
import { print } from '../../src/printers';

const resolveTestResource = path.resolve.bind(path, __dirname, '..' /* integration */, '..' /* test */, '..' /* dist */, 'testResources', 'printer');

describe('parse and print integration', () => {
  describe('echo', () => {
    it('should be able to echo html files with multiple script tags', async () => {
      await actArrangeAndAssert('echo/hello-world.html');
    });

    it('should leave comments in a typescript file', async () => {
      await actArrangeAndAssert('echo/ts-with-comments.ts');
    });

    async function actArrangeAndAssert(relativeFileName: string) {
      const fileName = resolveTestResource(relativeFileName);
      const code = await fs.readFile(resolveTestResource(fileName), 'utf8');
      const parsed = await parse(code, fileName);
      const output = print(parsed);
      expect(normalizeWhitespaces(output)).eq(normalizeWhitespaces(code));
    }
  });
});
