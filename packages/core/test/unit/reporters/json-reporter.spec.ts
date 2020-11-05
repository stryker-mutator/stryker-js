import * as path from 'path';

import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import JsonReporter from '../../../src/reporters/json-reporter';
import * as JsonReporterUtil from '../../../src/reporters/reporter-util';

describe(JsonReporter.name, () => {
  let writeFileStub: sinon.SinonStub;
  let sut: JsonReporter;

  beforeEach(() => {
    writeFileStub = sinon.stub(JsonReporterUtil, 'writeFile');
    sut = testInjector.injector.injectClass(JsonReporter);
  });

  describe('onMutationTestReportReady', () => {
    it('should use configured file path', async () => {
      testInjector.options.jsonReporter = {
        baseDir: 'foo/bar',
        filename: 'myReport.json',
      };
      const expectedPath = path.normalize('foo/bar/myReport.json');
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
      const report: mutationTestReportSchema.MutationTestResult = {
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
