import { normalize, join } from 'path';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Config } from 'stryker-api/config';
import * as util from '../../src/util';
import HtmlReporter from '../../src/HtmlReporter';
import { sourceFile, mutantResult, scoreResult } from '../helpers/producers';

describe('HtmlReporter', () => {
  let sandbox: sinon.SinonSandbox;
  let copyFolderStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;
  let mkdirStub: sinon.SinonStub;
  let deleteDirStub: sinon.SinonStub;
  let sut: HtmlReporter;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    copyFolderStub = sandbox.stub(util, 'copyFolder');
    writeFileStub = sandbox.stub(util, 'writeFile');
    deleteDirStub = sandbox.stub(util, 'deleteDir');
    mkdirStub = sandbox.stub(util, 'mkdir');
    sut = new HtmlReporter(new Config());
  });

  afterEach(() => sandbox.restore());

  describe('when in happy flow', () => {

    beforeEach(() => {
      copyFolderStub.resolves();
      writeFileStub.resolves();
      deleteDirStub.resolves();
      mkdirStub.resolves();
    });

    it('should copy common resources', async () => {
      sut.onAllSourceFilesRead([]);
      sut.onAllMutantsTested([]);
      sut.onScoreCalculated(scoreResult());
      await sut.wrapUp();
      expect(copyFolderStub).calledWith(join(__dirname, '..', '..', 'resources'), normalize('reports/mutation/html/strykerResources'));
    });

    it('should write an html report', async () => {
      sut.onAllSourceFilesRead([sourceFile({ path: normalize('src/a.js') }), sourceFile({ path: normalize('src/b.js') })]);
      sut.onAllMutantsTested([mutantResult({ sourceFilePath: normalize('src/a.js') }), mutantResult({ sourceFilePath: normalize('src/b.js') })]);
      sut.onScoreCalculated(scoreResult({
        childResults: [
          scoreResult({ name: normalize('a.js'), path: normalize('src/a.js'), representsFile: true }),
          scoreResult({ name: normalize('b.js'), path: normalize('src/b.js'), representsFile: true }),
        ],
        name: 'src'
      }));
      await sut.wrapUp();
      expect(writeFileStub).calledWithMatch(
        sinon.match(normalize('reports/mutation/html/a.js.html')),
        sinon.match('10.67%')
          .and(sinon.match('<span class="badge badge-info stryker-mutant-replacement" hidden="hidden" data-mutant="0">{}</span>'))
          .and(sinon.match('<link rel="stylesheet" href="strykerResources/bootstrap/css/bootstrap.min.css">')));
      expect(writeFileStub).calledWithMatch(
        sinon.match(normalize('reports/mutation/html/b.js.html')),
        sinon.match('10.67%'));
    });

    it('should honor the relative path if child results skip a directory (issue #335)', async () => {
      // see https://github.com/stryker-mutator/stryker/issues/335
      sut.onAllSourceFilesRead([
        sourceFile({ path: normalize('a/b/c.js') }),
        sourceFile({ path: normalize('a/b/d.js') })
      ]);
      sut.onAllMutantsTested([]);
      sut.onScoreCalculated(scoreResult({
        childResults: [
          scoreResult({
            childResults: [
              scoreResult({ representsFile: true, name: 'c.js', path: normalize('a/b/c.js') }),
              scoreResult({ representsFile: true, name: 'd.js', path: normalize('a/b/d.js') })
            ],
            name: normalize('a/b')
          })
        ],
        name: ''
      }));
      await sut.wrapUp();
      expect(writeFileStub).calledWith(
        normalize('reports/mutation/html/a/b/c.js.html'),
        sinon.match('<link rel="stylesheet" href="../../strykerResources/bootstrap/css/bootstrap.min.css">')
          .and(sinon.match('<script src="../../strykerResources/stryker.js" defer="defer"></script>')));
    });

    it('should not fail when input files are missing', async () => {
      sut.onAllSourceFilesRead([]);
      sut.onAllMutantsTested([]);
      sut.onScoreCalculated(scoreResult({
        childResults: [
          scoreResult({ name: normalize('b.js'), representsFile: true })
        ],
        name: 'src'
      }));
      await sut.wrapUp();
      expect(writeFileStub).calledWith(normalize('reports/mutation/html/b.js.html'),
        sinon.match('The source code itself was not reported at the `stryker-html-reporter`. Please report this issue at https://github.com/stryker-mutator/stryker/issues'));
    });
  });

  describe('when copy folder fails', () => {
    const error = new Error('42');

    beforeEach(() => {
      copyFolderStub.rejects(error);
      writeFileStub.resolves();
      deleteDirStub.resolves();
      mkdirStub.resolves();
    });

    it('should reject with that error', () => {
      sut.onAllMutantsTested([]);
      sut.onAllSourceFilesRead([]);
      sut.onScoreCalculated(scoreResult({}));
      return expect(sut.wrapUp()).to.eventually.be.rejectedWith(error);
    });
  });

  describe('when writeFile fails', () => {
    const error = new Error('42');

    beforeEach(() => {
      copyFolderStub.resolves();
      writeFileStub.rejects(error);
      deleteDirStub.resolves();
      mkdirStub.resolves();
    });

    it('should reject with that error', () => {
      sut.onAllMutantsTested([]);
      sut.onAllSourceFilesRead([]);
      sut.onScoreCalculated(scoreResult({}));
      return expect(sut.wrapUp()).to.eventually.be.rejectedWith(error);
    });
  });

  describe('when deleteDir fails', () => {
    const error = new Error('42');

    beforeEach(() => {
      copyFolderStub.resolves();
      writeFileStub.resolves();
      deleteDirStub.rejects(error);
      mkdirStub.resolves();
    });

    it('should reject with that error', () => {
      sut.onAllMutantsTested([]);
      sut.onAllSourceFilesRead([]);
      sut.onScoreCalculated(scoreResult({}));
      return expect(sut.wrapUp()).to.eventually.be.rejectedWith(error);
    });
  });

  describe('when mkdir fails', () => {
    const error = new Error('42');

    beforeEach(() => {
      copyFolderStub.resolves();
      writeFileStub.resolves();
      deleteDirStub.resolves(error);
      mkdirStub.rejects(error);
    });

    it('should reject with that error', () => {
      sut.onAllMutantsTested([]);
      sut.onAllSourceFilesRead([]);
      sut.onScoreCalculated(scoreResult({}));
      return expect(sut.wrapUp()).to.eventually.be.rejectedWith(error);
    });
  });
});
