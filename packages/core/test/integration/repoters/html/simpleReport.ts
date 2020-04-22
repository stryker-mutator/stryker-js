import { mutationTestReportSchema } from '@stryker-mutator/api/report';

export const simpleReport: mutationTestReportSchema.MutationTestResult = {
  files: {
    'test.js': {
      language: 'javascript',
      mutants: [
        {
          id: '3',
          location: {
            end: {
              column: 13,
              line: 1,
            },
            start: {
              column: 1,
              line: 1,
            },
          },
          mutatorName: 'String Literal',
          replacement: '""',
          status: mutationTestReportSchema.MutantStatus.Survived,
        },
        {
          id: '1',
          location: {
            end: {
              column: 13,
              line: 3,
            },
            start: {
              column: 12,
              line: 3,
            },
          },
          mutatorName: 'Arithmetic Operator',
          replacement: '-',
          status: mutationTestReportSchema.MutantStatus.Survived,
        },
      ],
      source: '"use strict";\nfunction add(a, b) {\n  return a + b;\n}',
    },
  },
  schemaVersion: '1.0',
  thresholds: {
    high: 80,
    low: 60,
  },
};
