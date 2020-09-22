import { default as Stryker } from '@stryker-mutator/core';
import { expect } from 'chai';
import { CoverageAnalysisReporter } from './coverage-analysis-reporter';
import { calculateMetrics, Metrics } from 'mutation-testing-metrics';

const expectedTestCount = Object.freeze({
  off: 18,
  all: 12,
  perTest: 6
});

describe('Coverage analysis', () => {
  it('should provide the expected with --coverageAnalysis off', async () => {
    // Arrange
    const stryker = new Stryker({
      coverageAnalysis: 'off',
      testRunner: 'jasmine',
      reporters: ['coverageAnalysis'],
      plugins: ['@stryker-mutator/jasmine-runner', require.resolve('./coverage-analysis-reporter')]
    });

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
    const stryker = new Stryker({
      coverageAnalysis: 'all',
      testRunner: 'jasmine',
      reporters: ['coverageAnalysis'],
      plugins: ['@stryker-mutator/jasmine-runner', require.resolve('./coverage-analysis-reporter')]
    });

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
    const stryker = new Stryker({
      coverageAnalysis: 'perTest',
      testRunner: 'jasmine',
      reporters: ['coverageAnalysis'],
      plugins: ['@stryker-mutator/jasmine-runner', require.resolve('./coverage-analysis-reporter')]
    });

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
});
