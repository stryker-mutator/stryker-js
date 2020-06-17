import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import KarmaTestRunner from '../../src/KarmaTestRunner';
import { KarmaRunnerOptionsWithStrykerOptions } from '../../src/KarmaRunnerOptionsWithStrykerOptions';

import path = require('path');

function createSut() {
  return testInjector.injector.injectClass(KarmaTestRunner);
}

describe(`${KarmaTestRunner.name} running on instrumented code`, () => {
  let sut: KarmaTestRunner;

  describe('dryRun', () => {
    before(async () => {
      (testInjector.options as KarmaRunnerOptionsWithStrykerOptions).karma = {
        projectType: 'custom',
        configFile: path.resolve(__dirname, '..', '..', 'testResources', 'instrumented', 'karma-jasmine.conf.js'),
      };
      sut = createSut();
      await sut.init();
    });

    it.only('should report coverageAnalysis if requested', async () => {
      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).ok;
      expect(result.mutantCoverage).keys('static', 'perTest');
    });
  });
});
