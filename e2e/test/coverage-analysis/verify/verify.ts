import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { default as Stryker } from '@stryker-mutator/core';
import { expect } from 'chai';
import { CoverageAnalysisReporter } from './coverage-analysis-reporter';
import { calculateMetrics, Metrics } from 'mutation-testing-metrics';
import { describe } from 'mocha';

describe('Coverage analysis', () => {
  let strykerOptions: PartialStrykerOptions;

  beforeEach(() => {
    strykerOptions = {
      coverageAnalysis: 'off', // changed each test
      reporters: ['coverageAnalysis', 'html'],
      timeoutMS: 60000,
      concurrency: 1,
      plugins: [require.resolve('./coverage-analysis-reporter')]
    }
  });

  describe('with the jasmine-runner', () => {
    beforeEach(() => {
      strykerOptions.testRunner = 'jasmine';
      strykerOptions.plugins!.push('@stryker-mutator/jasmine-runner');
      strykerOptions.jasmineConfigFile = 'jasmine-spec/support/jasmine.json';
    });
    
    describeTests({
      off: 18,
      all: 12,
      perTest: 6,
    });
  });
  
  describe('with the cucumber-runner', () => {
    beforeEach(() => {
      strykerOptions.testRunner = 'cucumber';
      strykerOptions.plugins!.push('@stryker-mutator/cucumber-runner');
      strykerOptions.cucumber = {
        profile: 'stryker',
        features: ['cucumber-features/*.feature']
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
      strykerOptions.testRunner = 'jest';
      strykerOptions.plugins!.push('@stryker-mutator/jest-runner');
      strykerOptions.jest = {
        configFile: 'jest-spec/jest.config.json',
      };
      strykerOptions.tempDirName = 'stryker-tmp';
    });

    describeTests({
      off: 14,
      all: 10,
      perTest: 6,
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
