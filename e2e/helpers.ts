import { promises as fs } from 'fs';

import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { expect } from 'chai';
import * as path from 'path';
import { calculateMetrics, MetricsResult, Metrics } from 'mutation-testing-metrics';

export async function readMutationTestResult(eventResultDirectory = path.resolve('reports', 'mutation', 'events')) {
  const allReportFiles = await fs.readdir(eventResultDirectory);
  const mutationTestReportFile = allReportFiles.find(file => !!file.match(/.*onMutationTestReportReady.*/));
  expect(mutationTestReportFile).ok;
  const mutationTestReportContent = await fs.readFile(path.resolve(eventResultDirectory, mutationTestReportFile || ''), 'utf8');
  const report = JSON.parse(mutationTestReportContent) as mutationTestReportSchema.MutationTestResult;
  const metricsResult = calculateMetrics(report.files);
  return metricsResult;
}

type WritableMetricsResult = {
  -readonly [K in keyof MetricsResult]: MetricsResult[K];
};

export async function expectMetricsResult(expectedMetricsResult: Partial<MetricsResult>) {
  const actualMetricsResult = await readMutationTestResult();
  const actualSnippet: Partial<WritableMetricsResult> = {};
  for (const key in expectedMetricsResult) {
    actualSnippet[key as keyof MetricsResult] = actualMetricsResult[key as keyof MetricsResult] as any;
  }
  if (actualSnippet.metrics) {
    if (typeof actualSnippet.metrics.mutationScore === 'number') {
      actualSnippet.metrics.mutationScore = parseFloat(actualSnippet.metrics.mutationScore.toFixed(2));
    }
    if (typeof actualSnippet.metrics.mutationScoreBasedOnCoveredCode === 'number') {
      actualSnippet.metrics.mutationScoreBasedOnCoveredCode = parseFloat(actualSnippet.metrics.mutationScoreBasedOnCoveredCode.toFixed(2));
    }

  }
  expect(actualSnippet).deep.eq(expectedMetricsResult);
}

export function produceMetrics(metrics: Partial<Metrics>): Metrics {
  return {
    compileErrors: 0,
    killed: 0,
    mutationScore: 0,
    mutationScoreBasedOnCoveredCode: 0,
    noCoverage: 0,
    runtimeErrors: 0,
    survived: 0,
    timeout: 0,
    totalCovered: 0,
    totalDetected: 0,
    totalInvalid: 0,
    totalMutants: 0,
    totalUndetected: 0,
    totalValid: 0,
    ...metrics
  };
}
