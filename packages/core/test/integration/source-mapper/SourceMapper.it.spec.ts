import * as path from 'path';

import { File } from '@stryker-mutator/api/core';
import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';

import { TranspiledSourceMapper } from '../../../src/transpiler/SourceMapper';

function resolve(...filePart: string[]) {
  return path.resolve(__dirname, '..', '..', '..', 'testResources', 'source-mapper', ...filePart);
}

function readFiles(...files: string[]): Promise<File[]> {
  return Promise.all(
    files.map(relative => resolve(relative)).map(fileName => fsAsPromised.readFile(fileName).then(content => new File(fileName, content)))
  );
}

describe('Source mapper integration', () => {
  let sut: TranspiledSourceMapper;

  describe('with external source maps', () => {
    beforeEach(async () => {
      const files = await readFiles(path.join('external-source-maps', 'js', 'math.js'), path.join('external-source-maps', 'js', 'math.js.map'));
      sut = new TranspiledSourceMapper(files);
    });

    it('it should be able to map to transpiled location', async () => {
      const actual = await sut.transpiledLocationFor({
        fileName: resolve('external-source-maps', 'ts', 'src', 'math.ts'),
        location: {
          end: { line: 7, column: 42 },
          start: { line: 7, column: 8 }
        }
      });
      expect(actual).deep.eq({
        fileName: resolve('external-source-maps', 'js', 'math.js'),
        location: {
          end: { line: 16, column: 0 },
          start: { line: 15, column: 10 }
        }
      });
    });
  });

  describe('with inline source maps', () => {
    beforeEach(async () => {
      const files = await readFiles(path.join('inline-source-maps', 'js', 'math.js'));
      sut = new TranspiledSourceMapper(files);
    });
    it('it should be able to map to transpiled location', async () => {
      const actual = await sut.transpiledLocationFor({
        fileName: resolve('inline-source-maps', 'ts', 'src', 'math.ts'),
        location: {
          end: { line: 7, column: 42 },
          start: { line: 7, column: 8 }
        }
      });
      expect(actual).deep.eq({
        fileName: resolve('inline-source-maps', 'js', 'math.js'),
        location: {
          end: { line: 16, column: 0 },
          start: { line: 15, column: 10 }
        }
      });
    });
  });
});
