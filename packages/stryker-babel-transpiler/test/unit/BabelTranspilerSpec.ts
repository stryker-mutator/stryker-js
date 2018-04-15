import * as path from 'path';
import BabelTranspiler from '../../src/BabelTranspiler';
import { expect } from 'chai';
import { File } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import * as babel from 'babel-core';
import BabelConfigReader, * as babelConfigReaderModule from '../../src/BabelConfigReader';
import { Mock, mock } from '../helpers/mock';

describe('BabelTranspiler', () => {
  let sut: BabelTranspiler;
  let sandbox: sinon.SinonSandbox;
  let files: File[];
  let transformStub: sinon.SinonStub;
  let config: Config;
  let babelConfigReaderMock: Mock<BabelConfigReader>;
  let babelOptions: any;

  beforeEach(() => {
    babelOptions = { someBabel: 'config' };
    babelConfigReaderMock = mock(BabelConfigReader);
    sandbox = sinon.sandbox.create();
    sandbox.stub(babelConfigReaderModule, 'default').returns(babelConfigReaderMock);
    transformStub = sandbox.stub(babel, 'transform');
    config = new Config();
    files = [
      new File(path.resolve('main.js'), 'const main = () => { sum(2); divide(2); }'),
      new File(path.resolve('sum.js'), 'const sum = (number) => number + number;'),
      new File(path.resolve('divide.js'), 'const divide = (number) => number / number;')
    ];
  });

  afterEach(() => sandbox.restore());


  describe('constructor', () => {

    function arrangeHappyFlow(transformResult: babel.BabelFileResult & { ignored?: boolean } = { code: 'code' }) {
      babelConfigReaderMock.readConfig.returns(babelOptions);
      sut = new BabelTranspiler({ config, produceSourceMaps: false });
    }

    it('should read babel config using the BabelConfigReader', () => {
      arrangeHappyFlow();
      expect(babelConfigReaderModule.default).calledWithNew;
      expect(babelConfigReaderMock.readConfig).calledWith(config);
    });

    it('should throw if `produceSourceMaps` was true', () => {
      expect(() => new BabelTranspiler({ produceSourceMaps: true, config })).throws('Invalid `coverageAnalysis` "perTest" is not supported by the stryker-babel-transpiler. Not able to produce source maps yet. Please set it to "off".');
    });
  });

  describe('transpile', () => {

    function arrangeHappyFlow(transformResult: babel.BabelFileResult & { ignored?: boolean } = { code: 'code' }) {
      babelConfigReaderMock.readConfig.returns(babelOptions);
      sut = new BabelTranspiler({ config, produceSourceMaps: false });
      transformStub.returns(transformResult);
    }

    it('should call the babel transform function for js files', async () => {
      arrangeHappyFlow();
      const actualResultFiles = await sut.transpile(files);
      files.forEach(file => {
        expect(transformStub).calledWith(file.textContent, {
          filename: file.name,
          filenameRelative: path.relative(process.cwd(), file.name),
          someBabel: 'config'
        });
      });
      expect(actualResultFiles).deep.eq(files.map(file => new File(file.name, 'code')));
    });

    it('should not allow a user to override the file name', async () => {
      babelOptions.filename = 'override';
      babelOptions.filenameRelative = 'override';
      arrangeHappyFlow();
      sut = new BabelTranspiler({ config, produceSourceMaps: false });
      await sut.transpile([files[0]]);
      expect(transformStub).calledWith(files[0].textContent, {
        filename: files[0].name,
        filenameRelative: path.relative(process.cwd(), files[0].name),
        someBabel: 'config'
      });
    });

    it('should not transpile binary files', async () => {
      arrangeHappyFlow();
      const inputFile = new File('myBinaryFile.png', 'S�L!##���XLDDDDDDDD\K�');
      const actualResultFiles = await sut.transpile([inputFile]);
      expect(actualResultFiles[0]).eq(inputFile);
      expect(transformStub).not.called;
    });

    it('should not transpile ignored files', async () => {
      arrangeHappyFlow({ ignored: true });
      const inputFiles = [new File('file.es6', 'pass through')];
      const actualResultFiles = await sut.transpile(inputFiles);
      expect(actualResultFiles).deep.eq(inputFiles);
    });

    it('should report an error if transpiled code was undefined', async () => {
      arrangeHappyFlow({ code: undefined });
      return expect(sut.transpile([new File('f.js', '')])).rejectedWith('Could not transpile file "f.js". Babel transform function delivered \`undefined\`.');
    });

    it('should only call the transform function when the file extension is a known file extension', async () => {
      arrangeHappyFlow();
      const inputFiles: File[] = [
        new File(`es6.es6`, 'es6 = true'),
        new File(`js.js`, 'js = true'),
        new File(`es.es`, 'es = true'),
        new File(`jsx.jsx`, 'jsx = true'),
        new File(`ignored.njs`, 'ignored')
      ];
      const actualResultFiles = await sut.transpile(inputFiles);
      expect(transformStub).callCount(inputFiles.length - 1);
      expect(transformStub).calledWith('es6 = true');
      expect(transformStub).calledWith('js = true');
      expect(transformStub).calledWith('es = true');
      expect(transformStub).calledWith('jsx = true');
      expect(actualResultFiles.map(file => file.name)).deep.eq([
        'es6.js',
        'js.js',
        'es.js',
        'jsx.js',
        'ignored.njs'
      ]);
    });

    it('should return with an error when the babel transform fails', async () => {
      const error = new Error('Syntax error');
      transformStub.throws(error);
      sut = new BabelTranspiler({ produceSourceMaps: false, config });
      return expect(sut.transpile([new File('picture.js', 'S�L!##���XLDDDDDDDD\K�')])).rejectedWith(`Error while transpiling "picture.js": ${error.stack}`);
    });
  });
});