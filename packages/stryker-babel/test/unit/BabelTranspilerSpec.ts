import BabelTranspiler from '../../src/BabelTranspiler';
import { expect, assert } from 'chai';
import { File } from 'stryker-api/core';
import { Transpiler } from 'stryker-api/transpile';
import { Position, FileKind } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { createFile } from '../helpers/producers';
import * as sinon from 'sinon';
import * as babel from 'babel-core';

describe('BabelTranspiler', () => {
  let babelTranspiler: Transpiler;
  let sandbox: sinon.SinonSandbox;
  let files: Array<File> = [];
  let transformStub: sinon.SinonStub;

  const knownFileExtensions = ['.js', '.jsx', '.ts'];

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    transformStub = sandbox.stub(babel, 'transform').callsFake((content) => {
      return {
        code: content
      };
    });

    babelTranspiler = new BabelTranspiler({ config: new Config, keepSourceMaps: false });

    files = [
      createFile('main.js', 'const main = () => { sum(2); devide(2); }'),
      createFile('sum.js', 'const sum = (number) => number + number;'),
      createFile('devide.js', 'const devide = (number) => number / number;')
    ];
  });

  afterEach(() => sandbox.restore());

  describe('transpile', () => {
    it('should call the babel transform function with all given text files', async () => {
      const transpileResult = await babelTranspiler.transpile(files);

      expect(transpileResult.outputFiles).to.deep.equal(files);
    });

    it('should not call the transform function with any file other than text files', async () => {
      await babelTranspiler.transpile([createFile('myBinaryFile.png', 'S�L!##���XLDDDDDDDD\K�', FileKind.Binary)]);

      assert(transformStub.notCalled);
    });

    it('should only call the transform function when the file extension is a known file extension', async () => {
      const files: Array<File> = [];

      knownFileExtensions.forEach((knownFileExtension) => {
        files.push(createFile('file'.concat(knownFileExtension), 'const a = 5;'));
      });

      const result = await babelTranspiler.transpile(files);

      assert(transformStub.callCount === knownFileExtensions.length);
      knownFileExtensions.forEach((knownFileExtension, key) => {
        expect(result.outputFiles[key]).to.not.equal(files[key]);
      });
    });

    it('should return with an error when the babel transform fails', async () => {
      transformStub.callsFake(() => ({ code: '' }));

      const transpileResult = await babelTranspiler.transpile([createFile('picture.js', 'S�L!##���XLDDDDDDDD\K�')]);

      expect(transpileResult.outputFiles).to.be.empty;
      expect(transpileResult.error).to.deep.equal('picture.js: Could not transpile file with the Babel transform function');
    });
  });

  describe('getMappedLocation', () => {
    it('should throw a not implemented error', () => {
      const position: Position = {
        line: 0,
        column: 0
      };

      const fileLocation: { fileName: string, start: Position, end: Position } = {
        fileName: 'test',
        start: position,
        end: position
      };

      expect(() => babelTranspiler.getMappedLocation(fileLocation)).to.throw(Error, 'Not implemented');
    });
  });
});