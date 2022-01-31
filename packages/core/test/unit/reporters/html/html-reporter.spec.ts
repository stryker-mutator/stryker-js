import path from 'path';

import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import { schema } from '@stryker-mutator/api/core';

import { HtmlReporter } from '../../../../src/reporters/html/html-reporter.js';
import * as ReporterUtil from '../../../../src/reporters/reporter-util.js';

describe(HtmlReporter.name, () => {
  let writeFileStub: sinon.SinonStub;
  let mkdirStub: sinon.SinonStub;
  let deleteDirStub: sinon.SinonStub;
  let sut: HtmlReporter;

  beforeEach(() => {
    writeFileStub = sinon.stub(ReporterUtil, 'writeFile');
    deleteDirStub = sinon.stub(ReporterUtil, 'deleteDir');
    mkdirStub = sinon.stub(ReporterUtil, 'mkdir');
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
      expect(testInjector.logger.debug).calledWith(
        `No base folder configuration found (using configuration: htmlReporter: { baseDir: 'output/folder' }), using default ${expectedBaseDir}`
      );
      expect(deleteDirStub).calledWith(expectedBaseDir);
    });

    it('should clean the base directory', async () => {
      actReportReady();
      await sut.wrapUp();
      expect(deleteDirStub).calledWith(path.normalize('reports/mutation/html'));
      expect(mkdirStub).calledWith(path.normalize('reports/mutation/html'));
      expect(deleteDirStub).calledBefore(mkdirStub);
    });

    it('should write the mutation report in the index file', async () => {
      const report: schema.MutationTestResult = {
        files: {
          'foo.js': {
            language: 'js',
            mutants: [],
            source: 'console.log("hello world")',
          },
        },
        schemaVersion: '1.0',
        thresholds: {
          high: 80,
          low: 60,
        },
      };
      sut.onMutationTestReportReady(report);
      await sut.wrapUp();
      expect(writeFileStub).calledWith(path.resolve('reports', 'mutation', 'html', 'index.html'), sinon.match(JSON.stringify(report)));
    });

    it('should escape HTML tags in the mutation testing report.', async () => {
      const report: schema.MutationTestResult = {
        files: {
          'index.html': {
            language: 'html',
            mutants: [],
            source: '<script></script>',
          },
        },
        schemaVersion: '1.0',
        thresholds: {
          high: 80,
          low: 60,
        },
      };
      sut.onMutationTestReportReady(report);
      await sut.wrapUp();
      expect(writeFileStub).calledWith(
        path.resolve('reports', 'mutation', 'html', 'index.html'),
        sinon.match('"source":"<" + "script><" + "/script>"')
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
  });

  function actReportReady() {
    sut.onMutationTestReportReady({ files: {}, schemaVersion: '', thresholds: { high: 0, low: 0 } });
  }
});
