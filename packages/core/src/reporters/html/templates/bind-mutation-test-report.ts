import { mutationTestReportSchema } from '@stryker-mutator/api/report';

export function bindMutationTestReport(report: mutationTestReportSchema.MutationTestResult) {
  return `document.querySelector('mutation-test-report-app').report = ${JSON.stringify(report)};`;
}
