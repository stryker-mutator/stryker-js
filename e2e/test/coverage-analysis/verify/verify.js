import { Stryker } from '@stryker-mutator/core';
import { expect } from 'chai';
import { calculateMetrics } from 'mutation-testing-metrics';

import { CoverageAnalysisReporter } from './coverage-analysis-reporter.js';

describe('Coverage analysis', () => {
  /**
   * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
   */
  let strykerOptions;

  beforeEach(() => {
    strykerOptions = {
      coverageAnalysis: 'off',
      reporters: ['coverageAnalysis', 'html'],
      timeoutMS: 60000,
      concurrency: 1,
      plugins: ['./verify/coverage-analysis-reporter.js'],
    };
  });

  describe('with the jasmine-runner', () => {
    beforeEach(() => {
      strykerOptions.testRunner = 'jasmine';
      strykerOptions.plugins.push('@stryker-mutator/jasmine-runner');
      strykerOptions.jasmineConfigFile = 'jasmine.json';
    });
    describeTests();
  });

  describe('with the cucumber-runner', () => {
    beforeEach(() => {
      strykerOptions.testRunner = 'cucumber';
      strykerOptions.plugins.push('@stryker-mutator/cucumber-runner');
      strykerOptions.cucumber = {
        profile: 'stryker',
        features: ['cucumber-features/*.feature'],
      };
    });
    describeTests();
  });

  describe('with the jest-runner', () => {
    beforeEach(() => {
      strykerOptions.testRunner = 'jest';
      strykerOptions.plugins.push('@stryker-mutator/jest-runner');
      strykerOptions.jest = {
        configFile: 'jest.config.json',
      };
      strykerOptions.tempDirName = 'stryker-tmp';
    });
    describeTests({
      off: 22,
      all: 18,
      perTest: 10,
    });
  });

  describe('with mocha-runner', () => {
    beforeEach(() => {
      strykerOptions.testRunner = 'mocha';
      strykerOptions.plugins.push('@stryker-mutator/mocha-runner');
    });
    describeTests();
  });

  describe('with karma-runner', () => {
    /**
     * @type {{ frameworks?: string[] }};
     */
    let karmaConfigOverrides;
    beforeEach(() => {
      strykerOptions.testRunner = 'karma';
      strykerOptions.plugins.push('@stryker-mutator/karma-runner');
      karmaConfigOverrides = {};
      strykerOptions.karma = {
        configFile: 'karma.conf.js',
        config: karmaConfigOverrides,
      };
    });
    describe('with mocha test framework', () => {
      beforeEach(() => {
        karmaConfigOverrides.frameworks = ['chai', 'mocha'];
      });
      describeTests();
    });
    describe('with jasmine test framework', () => {
      beforeEach(() => {
        karmaConfigOverrides.frameworks = ['chai', 'jasmine'];
      });
      describeTests({
        perTest: 22,
        ignoreStatic: 20,
      });
    });
  });

  /**
   * @typedef TestCount
   * @property {number} off
   * @property {number} all
   * @property {number} perTest
   * @property {number} ignoreStatic
   */

  /**
   * @param {Partial<TestCount>} [overrides]
   */
  function describeTests(overrides) {
    const expectedTestCount = {
      off: 30,
      all: 22,
      perTest: 10,
      ignoreStatic: 8,
      ...overrides,
    };
    it('should provide the expected with --coverageAnalysis off', async () => {
      // Arrange
      strykerOptions.coverageAnalysis = 'off';
      const stryker = new Stryker(strykerOptions);

      // Act
      const testsRan = (await stryker.runMutationTest()).reduce((a, b) => a + (b.testsCompleted ?? 0), 0);

      // Assert
      const metricsResult = calculateMetrics(CoverageAnalysisReporter.instance?.report.files);
      const expectedMetricsResult = {
        noCoverage: 0,
        survived: 3,
        killed: 8,
        mutationScore: 72.72727272727273,
      };
      expect(metricsResult.metrics).deep.include(expectedMetricsResult);
      expect(testsRan).eq(expectedTestCount.off);
    });

    it('should provide the expected with --coverageAnalysis all', async () => {
      // Arrange
      strykerOptions.coverageAnalysis = 'all';
      const stryker = new Stryker(strykerOptions);

      // Act
      const testsRan = (await stryker.runMutationTest()).reduce((a, b) => a + (b.testsCompleted ?? 0), 0);

      // Assert
      const metricsResult = calculateMetrics(CoverageAnalysisReporter.instance?.report.files);
      const expectedMetricsResult = {
        noCoverage: 2,
        survived: 1,
        killed: 8,
        mutationScore: 72.72727272727273,
      };
      expect(metricsResult.metrics).deep.include(expectedMetricsResult);
      expect(testsRan).eq(expectedTestCount.all);
    });

    it('should provide the expected with --coverageAnalysis perTest', async () => {
      // Arrange
      strykerOptions.coverageAnalysis = 'perTest';
      const stryker = new Stryker(strykerOptions);
      // Act
      const result = await stryker.runMutationTest();
      // Assert
      const testsRan = result.reduce((a, b) => a + (b.testsCompleted ?? 0), 0);
      const metricsResult = calculateMetrics(CoverageAnalysisReporter.instance?.report.files);
      /**
       * @type {Partial<import('mutation-testing-metrics').Metrics>}
       */
      const expectedMetricsResult = {
        noCoverage: 2,
        survived: 1,
        killed: 8,
        mutationScore: 72.72727272727273,
      };
      expect(metricsResult.metrics).deep.include(expectedMetricsResult);
      expect(testsRan).eq(expectedTestCount.perTest);
    });

    it('should provide the expected with --ignoreStatic', async () => {
      // Arrange
      strykerOptions.coverageAnalysis = 'perTest';
      strykerOptions.ignoreStatic = true;
      const stryker = new Stryker(strykerOptions);
      // Act
      const result = await stryker.runMutationTest();
      // Assert
      const testsRan = result.reduce((a, b) => a + (b.testsCompleted ?? 0), 0);
      const metricsResult = calculateMetrics(CoverageAnalysisReporter.instance?.report.files);
      const expectedMetricsResult = {
        ignored: 13,
        noCoverage: 2,
        survived: 1,
        killed: 7,
        mutationScore: 70,
      };
      expect(metricsResult.metrics).deep.include(expectedMetricsResult);
      expect(testsRan).eq(expectedTestCount.ignoreStatic);
    });
  }
});
