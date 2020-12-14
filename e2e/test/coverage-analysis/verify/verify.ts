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
        reporters: ['coverageAnalysis'],
        plugins: ['@stryker-mutator/jasmine-runner', require.resolve('./coverage-analysis-reporter')],
        jasmineConfigFile: 'jasmine-spec/support/jasmine.json'
      };
    })

    describeTests({
      off: 18,
      all: 12,
      perTest: 6
    })
  });

  describe('with the jest-runner', () => {

    beforeEach(() => {
      strykerOptions = {
        testRunner: 'jest',
        reporters: ['coverageAnalysis'],
        concurrency: 2,
        plugins: ['@stryker-mutator/jest-runner', require.resolve('./coverage-analysis-reporter')],
        jest: {
          configFile: 'jest-spec/jest.config.json'
        }
      };
    });

    describeTests({
      off: 14,
      all: 10,
      perTest: 6
    });

  });

  function describeTests(expectedTestCount: Readonly<{ off: number; all: number; perTest: number }>) {
    it('should provide the expected with --coverageAnalysis off', async () => {
      // Arrange
      strykerOptions.coverageAnalysis = 'off';
      const stryker = new Stryker(strykerOptions);

      // Act
      const testsRan = (await stryker.runMutationTest()).reduce((a, b) => a + b.nrOfTestsRan, 0);

      // Assert
      const metricsResult = calculateMetrics(CoverageAnalysisReporter.instance?.report.files);
      const expectedMetricsResult: Partial<Metrics> = {
        noCoverage: 0,
        survived: 3,
        killed: 5,
        mutationScore: 62.5
      };
      expect(metricsResult.metrics).deep.include(expectedMetricsResult);
      expect(testsRan).eq(expectedTestCount.off);
    });

    it('should provide the expected with --coverageAnalysis all', async () => {
      // Arrange
      strykerOptions.coverageAnalysis = 'all';
      const stryker = new Stryker(strykerOptions);

      // Act
      const testsRan = (await stryker.runMutationTest()).reduce((a, b) => a + b.nrOfTestsRan, 0);

      // Assert
      const metricsResult = calculateMetrics(CoverageAnalysisReporter.instance?.report.files);
      const expectedMetricsResult: Partial<Metrics> = {
        noCoverage: 2,
        survived: 1,
        killed: 5,
        mutationScore: 62.5
      };
      expect(metricsResult.metrics).deep.include(expectedMetricsResult);
      expect(testsRan).eq(expectedTestCount.all);
    });

    it('should provide the expected with --coverageAnalysis perTest', async () => {
      // Arrange
      strykerOptions.coverageAnalysis = 'perTest';
      const stryker = new Stryker(strykerOptions);

      // Act
      const testsRan = (await stryker.runMutationTest()).reduce((a, b) => a + b.nrOfTestsRan, 0);

      // Assert
      const metricsResult = calculateMetrics(CoverageAnalysisReporter.instance?.report.files);
      const expectedMetricsResult: Partial<Metrics> = {
        noCoverage: 2,
        survived: 1,
        killed: 5,
        mutationScore: 62.5
      };
      expect(metricsResult.metrics).deep.include(expectedMetricsResult);
      expect(testsRan).eq(expectedTestCount.perTest);
    });
  }
});
