import path from 'path';

import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import { schema } from '@stryker-mutator/api/core';

import { JsonReporter } from '../../../src/reporters/json-reporter.js';
import { reporterUtil } from '../../../src/reporters/reporter-util.js';

describe(JsonReporter.name, () => {
  let writeFileStub: sinon.SinonStub;
  let sut: JsonReporter;

  beforeEach(() => {
    writeFileStub = sinon.stub(reporterUtil, 'writeFile');
    sut = testInjector.injector.injectClass(JsonReporter);
  });

  describe('onMutationTestReportReady', () => {
    it('should use configured file path', async () => {
      const fileName = 'foo/bar/myReport.json';
      const expectedPath = path.normalize(fileName);
      testInjector.options.jsonReporter = {
        fileName,
      };
      actReportReady();
      await sut.wrapUp();
      expect(testInjector.logger.debug).calledWith(`Using relative path ${expectedPath}`);
    });

    it('should use default base directory when no override is configured', async () => {
      const expectedPath = path.normalize('reports/mutation/mutation.json');
      actReportReady();
      await sut.wrapUp();
      expect(testInjector.logger.debug).calledWith(`Using relative path ${expectedPath}`);
    });

    it('should write the mutation report to disk', async () => {
      const report: schema.MutationTestResult = {
        files: {},
        schemaVersion: '1.0',
        thresholds: {
          high: 80,
          low: 60,
        },
      };
      sut.onMutationTestReportReady(report);
      await sut.wrapUp();
      expect(writeFileStub).calledWith(path.resolve('reports', 'mutation', 'mutation.json'), JSON.stringify(report));
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
