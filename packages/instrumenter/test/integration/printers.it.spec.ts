import { promises as fsPromises } from 'fs';

import { normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';

import { createParser } from '../../src/parsers/index.js';
import { print } from '../../src/printers/index.js';
import { createParserOptions } from '../helpers/factories.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

const resolvePrinterTestResource = resolveTestResource.bind(null, 'printer');

describe('parse and print integration', () => {
  describe('echo', () => {
    it('should leave comments in a typescript file', async () => {
      await actArrangeAndAssert('ts-with-comments.ts');
    });

    async function actArrangeAndAssert(relativeFileName: string) {
      const fileName = resolvePrinterTestResource('echo', relativeFileName);
      const code = await fsPromises.readFile(fileName, 'utf8');
      const parsed = await createParser(createParserOptions())(code, fileName);
      const output = print(parsed);
      expect(normalizeWhitespaces(output)).eq(normalizeWhitespaces(code));
    }
  });
  describe('html', () => {
    it('should be able to print html files with multiple script tags', async () => {
      await actArrangeAndAssert('hello-world');
    });

    async function actArrangeAndAssert(testCase: string) {
      const inputFileName = resolvePrinterTestResource('html', `${testCase}.in.html`);
      const outputFileName = resolvePrinterTestResource('html', `${testCase}.out.html`);
      const [input, expectedOutput] = await Promise.all([fsPromises.readFile(inputFileName, 'utf8'), fsPromises.readFile(outputFileName, 'utf8')]);
      const parsed = await createParser(createParserOptions())(input, inputFileName);
      const actualOutput = print(parsed);
      expect(normalizeWhitespaces(actualOutput)).eq(normalizeWhitespaces(expectedOutput));
    }
  });
});
