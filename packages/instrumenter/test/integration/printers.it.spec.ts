import path from 'path';
import { promises as fs } from 'fs';

import { normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';

import { createParser } from '../../src/parsers';
import { print } from '../../src/printers';
import { createParserOptions } from '../helpers/factories';

const resolveTestResource = path.resolve.bind(path, __dirname, '..' /* integration */, '..' /* test */, '..' /* dist */, 'testResources', 'printer');

describe('parse and print integration', () => {
  describe('echo', () => {
    it('should leave comments in a typescript file', async () => {
      await actArrangeAndAssert('ts-with-comments.ts');
    });

    async function actArrangeAndAssert(relativeFileName: string) {
      const fileName = resolveTestResource('echo', relativeFileName);
      const code = await fs.readFile(fileName, 'utf8');
      const parsed = await createParser(createParserOptions())(code, fileName);
      const output = print(parsed);
      expect(normalizeWhitespaces(output)).eq(normalizeWhitespaces(code));
    }
  });
  describe('html', () => {
    it('should be able to print html files with multiple script tags and add // @ts-nocheck comments', async () => {
      await actArrangeAndAssert('hello-world');
    });

    async function actArrangeAndAssert(testCase: string) {
      const inputFileName = resolveTestResource('html', `${testCase}.in.html`);
      const outputFileName = resolveTestResource('html', `${testCase}.out.html`);
      const [input, expectedOutput] = await Promise.all([fs.readFile(inputFileName, 'utf8'), fs.readFile(outputFileName, 'utf8')]);
      const parsed = await createParser(createParserOptions())(input, inputFileName);
      const actualOutput = print(parsed);
      expect(normalizeWhitespaces(actualOutput)).eq(normalizeWhitespaces(expectedOutput));
    }
  });
});
