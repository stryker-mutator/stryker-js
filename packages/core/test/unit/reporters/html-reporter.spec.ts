import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import { schema } from '@stryker-mutator/api/core';

import { HtmlReporter } from '../../../src/reporters/html-reporter.js';
import { reporterUtil } from '../../../src/reporters/reporter-util.js';

describe(HtmlReporter.name, () => {
  let writeFileStub: sinon.SinonStubbedMember<typeof reporterUtil.writeFile>;
  let sut: HtmlReporter;

  beforeEach(() => {
    writeFileStub = sinon.stub(reporterUtil, 'writeFile');
    sut = testInjector.injector.injectClass(HtmlReporter);
  });

  describe('onMutationTestReportReady', () => {
    it('should use configured file name', async () => {
      testInjector.options.htmlReporter = { fileName: 'foo/bar.html' };
      actReportReady();
      await sut.wrapUp();
      expect(testInjector.logger.debug).calledWith('Using file "foo/bar.html"');
      sinon.assert.calledWithExactly(writeFileStub, 'foo/bar.html', sinon.match.string);
    });

    it('should write the mutation report to the report file', async () => {
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
      sinon.assert.calledWithExactly(writeFileStub, 'reports/mutation/mutation.html', sinon.match(JSON.stringify(report)));
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
      sinon.assert.calledWithExactly(writeFileStub, 'reports/mutation/mutation.html', sinon.match('"source":"<"+"script><"+"/script>"'));
    });
  });

  describe('wrapUp', () => {
    it('should resolve when everything is OK', () => {
      actReportReady();
      return expect(sut.wrapUp()).eventually.undefined;
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
