import * as path from 'path';

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { BabelConfigReader, StrykerBabelConfig } from '../../src/BabelConfigReader';
import { BabelTranspiler } from '../../src/BabelTranspiler';
import * as babel from '../../src/helpers/babelWrapper';
import { Mock, mock } from '../helpers/mock';

describe(BabelTranspiler.name, () => {
  let sut: BabelTranspiler;
  let files: File[];
  let transformStub: sinon.SinonStub;
  let options: StrykerOptions;
  let babelConfigReaderMock: Mock<BabelConfigReader>;
  let babelConfig: StrykerBabelConfig;

  beforeEach(() => {
    babelConfig = {
      extensions: [],
      options: {},
      optionsFile: null
    };
    babelConfigReaderMock = mock(BabelConfigReader);
    transformStub = sinon.stub();
    sinon.stub(babel, 'transformSync').value(transformStub);
    options = factory.strykerOptions();
    files = [
      new File(path.resolve('main.js'), 'const main = () => { sum(2); divide(2); }'),
      new File(path.resolve('sum.js'), 'const sum = (number) => number + number;'),
      new File(path.resolve('divide.js'), 'const divide = (number) => number / number;')
    ];
    babelConfigReaderMock.readConfig.returns(babelConfig);
  });

  function createSut(produceSourceMaps = false) {
    return testInjector.injector
      .provideValue(commonTokens.produceSourceMaps, produceSourceMaps)
      .provideValue('babelConfigReader', (babelConfigReaderMock as unknown) as BabelConfigReader)
      .injectClass(BabelTranspiler);
  }

  describe('constructor', () => {
    function arrangeHappyFlow() {
      babelConfigReaderMock.readConfig.returns(babelConfig);
      sut = createSut();
    }

    it('should read babel config using the BabelConfigReader', () => {
      arrangeHappyFlow();
      expect(babelConfigReaderMock.readConfig).calledWith(options);
    });

    it('should throw if `produceSourceMaps` was true and coverage analysis is "perTest"', () => {
      options.coverageAnalysis = 'perTest';
      expect(() => new BabelTranspiler(options, /*produceSourceMaps:*/ true, (babelConfigReaderMock as unknown) as BabelConfigReader)).throws(
        'Invalid `coverageAnalysis` "perTest" is not supported by the stryker-babel-transpiler. Not able to produce source maps yet. Please set it to "off".'
      );
    });
  });

  describe('transpile', () => {
    function arrangeHappyFlow(transformResult: babel.BabelFileResult | null = { code: 'code' }) {
      sut = new BabelTranspiler(options, /*produceSourceMaps:*/ false, (babelConfigReaderMock as unknown) as BabelConfigReader);
      transformStub.returns(transformResult);
    }

    it('should call the babel transform function for js files', async () => {
      arrangeHappyFlow();
      const actualResultFiles = await sut.transpile(files);
      expect(transformStub).calledThrice;
      files.forEach(file => {
        expect(transformStub).calledWith(file.textContent, {
          cwd: process.cwd(),
          filename: file.name,
          filenameRelative: path.relative(process.cwd(), file.name)
        });
      });
      expect(actualResultFiles).deep.eq(files.map(file => new File(file.name, 'code')));
    });

    it('should allow users to define babel options', async () => {
      const plugins = ['fooPlugin', 'barPlugin'];
      babelConfig.options.plugins = plugins.slice();
      arrangeHappyFlow();
      await sut.transpile(files);
      files.forEach(file => {
        expect(transformStub).calledWith(file.textContent, {
          cwd: process.cwd(),
          filename: file.name,
          filenameRelative: path.relative(process.cwd(), file.name),
          plugins
        });
      });
    });

    it('should not allow a user to override the file name', async () => {
      babelConfig.options.filename = 'override';
      babelConfig.options.filenameRelative = 'override';
      arrangeHappyFlow();
      sut = new BabelTranspiler(options, /*produceSourceMaps:*/ false, (babelConfigReaderMock as unknown) as BabelConfigReader);
      await sut.transpile([files[0]]);
      expect(transformStub).calledWith(files[0].textContent, {
        cwd: process.cwd(),
        filename: files[0].name,
        filenameRelative: path.relative(process.cwd(), files[0].name)
      });
    });

    it('should not transpile binary files', async () => {
      arrangeHappyFlow();
      // eslint-disable-next-line
      const inputFile = new File('myBinaryFile.png', 'S�L!##���XLDDDDDDDD\K�');
      const actualResultFiles = await sut.transpile([inputFile]);
      expect(actualResultFiles[0]).eq(inputFile);
      expect(transformStub).not.called;
    });

    it('should not transpile ignored files', async () => {
      arrangeHappyFlow(null);
      const inputFiles = [new File('file.es6', 'pass through')];
      const actualResultFiles = await sut.transpile(inputFiles);
      expect(actualResultFiles).deep.eq(inputFiles);
    });

    it('should report an error if transpiled code was undefined', async () => {
      arrangeHappyFlow({ code: undefined });
      return expect(sut.transpile([new File('f.js', '')])).rejectedWith(
        'Could not transpile file "f.js". Babel transform function delivered `undefined`.'
      );
    });

    it('should only call the transform function when the file extension is a known file extension', async () => {
      arrangeHappyFlow();
      const inputFiles: File[] = [
        new File('es6.es6', 'es6 = true'),
        new File('js.js', 'js = true'),
        new File('es.es', 'es = true'),
        new File('jsx.jsx', 'jsx = true'),
        new File('ignored.njs', 'ignored')
      ];
      const actualResultFiles = await sut.transpile(inputFiles);
      expect(transformStub).callCount(inputFiles.length - 1);
      expect(transformStub).calledWith('es6 = true');
      expect(transformStub).calledWith('js = true');
      expect(transformStub).calledWith('es = true');
      expect(transformStub).calledWith('jsx = true');
      expect(actualResultFiles.map(file => file.name)).deep.eq(['es6.js', 'js.js', 'es.js', 'jsx.js', 'ignored.njs']);
    });

    it('should return with an error when the babel transform fails', async () => {
      const error = new Error('Syntax error');
      transformStub.throws(error);
      sut = createSut();
      // eslint-disable-next-line
      return expect(sut.transpile([new File('picture.js', 'S�L!##���XLDDDDDDDD\K�')])).rejectedWith(
        'Error while transpiling "picture.js". Inner error: Error: Syntax error'
      );
    });
  });
});
