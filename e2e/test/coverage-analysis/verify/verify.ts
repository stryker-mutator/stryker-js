import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { default as Stryker } from '@stryker-mutator/core';
import { expect } from 'chai';
import { CoverageAnalysisReporter } from './coverage-analysis-reporter';
import { calculateMetrics, Metrics } from 'mutation-testing-metrics';
import { describe } from 'mocha';

describe('Coverage analysis', () => {
  let strykerOptions: PartialStrykerOptions;

  describe('with the jasmine-runner', () => {
    beforeEach(() => {
      strykerOptions = {
        coverageAnalysis: 'off',
        testRunner: 'jasmine',
        reporters: ['coverageAnalysis', 'html'],
        timeoutMS: 60000,
        concurrency: 2,
        plugins: ['@stryker-mutator/jasmine-runner', require.resolve('./coverage-analysis-reporter')],
        jasmineConfigFile: 'jasmine.json',
      };
    });

    describeTests({
      off: 18,
      all: 12,
      perTest: 6,
    });
  });

  describe('with the cucumber-runner', () => {
    beforeEach(() => {
      strykerOptions = {
        coverageAnalysis: 'off',
        testRunner: 'cucumber',
        reporters: ['coverageAnalysis', 'html'],
        concurrency: 1,
        cucumber: {
          profile: 'stryker',
          features: ['cucumber-features/*.feature'],
        },
        plugins: ['@stryker-mutator/cucumber-runner', require.resolve('./coverage-analysis-reporter')],
        // testRunnerNodeArgs: ['--inspect-brk'],
        timeoutMS: 99999,
      };
    });

    describeTests({
      off: 18,
      all: 12,
      perTest: 6,
    });
  });

  describe('with the jest-runner', () => {
    beforeEach(() => {
      strykerOptions = {
        testRunner: 'jest',
        tempDirName: 'stryker-tmp',
        reporters: ['coverageAnalysis'],
        concurrency: 2,
        plugins: ['@stryker-mutator/jest-runner', require.resolve('./coverage-analysis-reporter')],
        jest: {
          configFile: 'jest.config.json',
        },
      };
    });

    describeTests({
      off: 14,
      all: 10,
      perTest: 6,
    });
  });

  describe('with mocha-runner', () => {
    beforeEach(() => {
      strykerOptions = {
        coverageAnalysis: 'off',
        testRunner: 'mocha',
        reporters: ['coverageAnalysis', 'html'],
        timeoutMS: 60000,
        concurrency: 2,
        plugins: ['@stryker-mutator/mocha-runner', require.resolve('./coverage-analysis-reporter')],
      };
    });

    describeTests({
      off: 18,
      all: 12,
      perTest: 6,
    });
  });

  describe('with karma-runner', () => {
    let karmaConfigOverrides: { frameworks?: string[] };
    beforeEach(() => {
      karmaConfigOverrides = {};
      strykerOptions = {
        coverageAnalysis: 'off',
        testRunner: 'karma',
        reporters: ['coverageAnalysis', 'html'],
        timeoutMS: 60000,
        concurrency: 1,
        plugins: ['@stryker-mutator/karma-runner', require.resolve('./coverage-analysis-reporter')],
        karma: {
          configFile: 'karma.conf.js',
          config: karmaConfigOverrides,
        },
      };
    });

    describe('with mocha test framework', () => {
      beforeEach(() => {
        karmaConfigOverrides.frameworks = ['chai', 'mocha'];
      });
      
      describeTests({
        off: 18,
        all: 12,
        perTest: 6,
      });
    });

    describe('with jasmine test framework', () => {
      beforeEach(() => {
        karmaConfigOverrides.frameworks = ['chai', 'jasmine'];
      });
      
      describeTests({
        off: 18,
        all: 12,
        perTest: 12, // Should be 6, see https://github.com/karma-runner/karma-jasmine/pull/290
      });
    });
  });

  function describeTests(expectedTestCount: Readonly<{ off: number; all: number; perTest: number }>) {
    it('should provide the expected with --coverageAnalysis off', async () => {
      // Arrange
      strykerOptions.coverageAnalysis = 'off';
      const stryker = new Stryker(strykerOptions);

      // Act
      const testsRan = (await stryker.runMutationTest()).reduce((a, b) => a + (b.testsCompleted ?? 0), 0);

      // Assert
      const metricsResult = calculateMetrics(CoverageAnalysisReporter.instance?.report.files);
      const expectedMetricsResult: Partial<Metrics> = {
        noCoverage: 0,
        survived: 3,
        killed: 5,
        mutationScore: 62.5,
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
      const expectedMetricsResult: Partial<Metrics> = {
        noCoverage: 2,
        survived: 1,
        killed: 5,
        mutationScore: 62.5,
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
      const expectedMetricsResult: Partial<Metrics> = {
        noCoverage: 2,
        survived: 1,
        killed: 5,
        mutationScore: 62.5,
      };
      expect(metricsResult.metrics).deep.include(expectedMetricsResult);
      expect(testsRan).eq(expectedTestCount.perTest);
    });
  }
});
