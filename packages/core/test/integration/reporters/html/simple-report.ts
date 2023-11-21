import { schema } from '@stryker-mutator/api/core';

export const simpleReport: schema.MutationTestResult = {
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
          status: 'Survived',
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
          status: 'Survived',
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
