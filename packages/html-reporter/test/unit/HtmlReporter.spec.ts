import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import HtmlReporter from '../../src/HtmlReporter';
import { bindMutationTestReport } from '../../src/templates/bindMutationTestReport';
import * as util from '../../src/util';

describe(HtmlReporter.name, () => {
  let copyFileStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;
  let mkdirStub: sinon.SinonStub;
  let deleteDirStub: sinon.SinonStub;
  let sut: HtmlReporter;

  beforeEach(() => {
    copyFileStub = sinon.stub(util, 'copyFile');
    writeFileStub = sinon.stub(util, 'writeFile');
    deleteDirStub = sinon.stub(util, 'deleteDir');
    mkdirStub = sinon.stub(util, 'mkdir');
    sut = testInjector.injector.injectClass(HtmlReporter);
  });

  describe('onMutationTestReportReady', () => {

    it('should use configured base directory', async () => {
      testInjector.options.htmlReporter = { baseDir: 'foo/bar' };
      actReportReady();
      await sut.wrapUp();
      expect(testInjector.logger.debug).calledWith('Using configured output folder foo/bar');
      expect(deleteDirStub).calledWith('foo/bar');
    });

    it('should use default base directory when no override is configured', async () => {
      const expectedBaseDir = path.normalize('reports/mutation/html');
      actReportReady();
      await sut.wrapUp();
      expect(testInjector.logger.debug).calledWith(`No base folder configuration found (using configuration: htmlReporter: { baseDir: 'output/folder' }), using default ${expectedBaseDir}`);
      expect(deleteDirStub).calledWith(expectedBaseDir);
    });

    it('should clean the base directory', async () => {
      actReportReady();
      await sut.wrapUp();
      expect(deleteDirStub).calledWith(path.normalize('reports/mutation/html'));
      expect(mkdirStub).calledWith(path.normalize('reports/mutation/html'));
      expect(deleteDirStub).calledBefore(mkdirStub);
    });

    it('should copy the template files', async () => {
      actReportReady();
      await sut.wrapUp();
      expect(copyFileStub).calledWith(
        path.resolve(__dirname, '..', '..', 'src', 'templates', 'stryker-80x80.png'),
        path.resolve('reports', 'mutation', 'html', 'stryker-80x80.png')
      );
      expect(copyFileStub).calledWith(
        path.resolve(__dirname, '..', '..', 'src', 'templates', 'index.html'),
        path.resolve('reports', 'mutation', 'html', 'index.html')
      );
    });

    it('should write the mutation report to disk', async () => {
      const report: mutationTestReportSchema.MutationTestResult = {
        files: {},
        schemaVersion: '1.0',
        thresholds: {
          high: 80,
          low: 60
        }
      };
      sut.onMutationTestReportReady(report);
      await sut.wrapUp();
      expect(writeFileStub).calledWith(
        path.resolve('reports', 'mutation', 'html', 'bind-mutation-test-report.js'),
        bindMutationTestReport(report)
      );
    });
  });

  describe('wrapUp', () => {

    it('should resolve when everything is OK', () => {
      actReportReady();
      return expect(sut.wrapUp()).eventually.undefined;
    });

    it('should reject when "deleteDir" rejects', () => {
      const expectedError = new Error('delete dir');
      deleteDirStub.rejects(expectedError);
      actReportReady();
      return expect(sut.wrapUp()).rejectedWith(expectedError);
    });

    it('should reject when "mkdir" rejects', () => {
      const expectedError = new Error('mkdir');
      mkdirStub.rejects(expectedError);
      actReportReady();
      return expect(sut.wrapUp()).rejectedWith(expectedError);
    });

    it('should reject when "writeFile" rejects', () => {
      const expectedError = new Error('writeFile');
      writeFileStub.rejects(expectedError);
      actReportReady();
      return expect(sut.wrapUp()).rejectedWith(expectedError);
    });

    it('should reject when "copyFile" rejects', () => {
      const expectedError = new Error('copyFile');
      copyFileStub.rejects(expectedError);
      actReportReady();
      return expect(sut.wrapUp()).rejectedWith(expectedError);
    });
  });

  function actReportReady() {
    sut.onMutationTestReportReady({ files: {}, schemaVersion: '', thresholds: { high: 0, low: 0 } });
  }
});
