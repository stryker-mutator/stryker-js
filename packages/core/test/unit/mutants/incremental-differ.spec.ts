import { MutantStatus } from '@stryker-mutator/api/core';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { Location, MutationTestResult } from 'mutation-testing-report-schema/api';

import { IncrementalDiffer } from '../../../src/mutants/index.js';
import { createMutant } from '../../helpers/producers.js';

// Keep this files here for the indenting
const srcAddContent = `export function add(a, b) {
  return a + b;
}            
`;
const srcMultiplyContent = `export function multiply(a, b) {
  return a * b;
}`;
const testAddContent = `import { expect } from 'chai';
import { add } from '../src/add.js';

describe('add' () => {
  it('should result in 42 for 2 and 40', () => {
    expect(add(40, 2)).eq(42);
  });
});
`;
const testMultiplyContent = `import { expect } from 'chai';
import { multiply } from '../src/multiply.js';

describe('multiply' () => {
  it('should result in 42 for 21 and 2', () => {
    expect(multiply(21, 2)).eq(42);
  });
});
`;

const srcAdd = 'src/add.js';
const srcMultiply = 'src/multiply.js';
const testAdd = 'test/add.spec.js';
const testMultiply = 'test/multiply.spec.js';

describe.only(IncrementalDiffer.name, () => {
  it('should copy status, statusReason, testsCompleted, killedBy and coveredBy if nothing changed', () => {
    // Arrange
    const currentFiles = new Map([[srcAdd, srcAddContent]]);
    const mutants = [createMutant({ id: '1', fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) })];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              coveredBy: ['1'],
              killedBy: ['1'],
              replacement: '-',
              mutatorName: 'min-replacement',
              statusReason: 'Killed by first test',
              testsCompleted: 2,
              status: MutantStatus.Killed,
              location: loc(1, 11, 1, 12),
            }),
          ],
          source: srcAddContent,
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    const expectedMutants = [
      createMutant({
        id: '1',
        fileName: srcAdd,
        replacement: '-',
        mutatorName: 'min-replacement',
        location: loc(1, 11, 1, 12),
        status: MutantStatus.Killed,
        statusReason: 'Killed by first test',
        testsCompleted: 2,
        killedBy: ['1'],
        coveredBy: ['1'],
      }),
    ];
    expect(actualDiff).deep.eq(expectedMutants);
  });

  it("should identify that a mutant hasn't changed if lines got added above", () => {
    // Arrange
    const currentFiles = new Map([[srcAdd, `import path from 'path';\n\n${srcAddContent}`]]);
    const mutants = [createMutant({ id: '1', fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(3, 11, 3, 12) })];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              replacement: '-',
              mutatorName: 'min-replacement',
              status: MutantStatus.Killed,
              location: loc(1, 11, 1, 12),
            }),
          ],
          source: srcAddContent,
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    expect(actualDiff[0].status).eq(MutantStatus.Killed);
  });

  it("should identify that a mutant hasn't changed if characters got added before", () => {
    // Arrange
    const comment = '/*text-added*/';
    const currentFiles = new Map([
      [
        srcAdd,
        srcAddContent
          .split('\n')
          .map((line, nr) => (nr === 1 ? `${comment}${line}` : line))
          .join('\n'),
      ],
    ]);
    const mutants = [
      createMutant({
        id: '1',
        fileName: srcAdd,
        replacement: '-',
        mutatorName: 'min-replacement',
        location: loc(1, 11 + comment.length, 1, 12 + comment.length),
      }),
    ];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              replacement: '-',
              mutatorName: 'min-replacement',
              status: MutantStatus.Killed,
              location: loc(1, 11, 1, 12),
            }),
          ],
          source: srcAddContent,
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    expect(actualDiff[0].status).eq(MutantStatus.Killed);
  });

  it("should identify that a mutant hasn't changed if lines got removed above", () => {
    // Arrange
    const currentFiles = new Map([[srcAdd, srcAddContent]]);
    const mutants = [createMutant({ id: '1', fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) })];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              replacement: '-',
              mutatorName: 'min-replacement',
              status: MutantStatus.Killed,
              location: loc(3, 11, 3, 12),
            }),
          ],
          source: `import path from "path"

          ${srcAddContent}`,
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    expect(actualDiff[0].status).eq(MutantStatus.Killed);
  });

  it("should identify that a mutant hasn't changed if characters got removed before", () => {
    // Arrange
    const comment = '/*text-removed*/';
    const currentFiles = new Map([[srcAdd, srcAddContent]]);
    const mutants = [createMutant({ id: '1', fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) })];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              replacement: '-',
              mutatorName: 'min-replacement',
              status: MutantStatus.Killed,
              location: loc(1, 11 + comment.length, 1, 12 + comment.length),
            }),
          ],
          source: srcAddContent
            .split('\n')
            .map((line, nr) => (nr === 1 ? `${comment}${line}` : line))
            .join('\n'),
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    expect(actualDiff[0].status).eq(MutantStatus.Killed);
  });

  it('should not reuse the status of a mutant in changed text', () => {
    // Arrange
    const currentFiles = new Map([[srcAdd, srcAddContent]]);
    const mutants = [createMutant({ id: '1', fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) })];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              replacement: '-',
              mutatorName: 'min-replacement',
              status: MutantStatus.Killed,
              location: loc(1, 11, 1, 12),
            }),
          ],
          source: srcAddContent.replace('+', '*'),
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    expect(actualDiff[0].status).undefined;
  });

  it('should not copy the status if the mutant came from a different mutator', () => {
    // Arrange
    const currentFiles = new Map([[srcAdd, srcAddContent]]);
    const mutants = [createMutant({ id: '1', fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) })];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              replacement: '-',
              mutatorName: 'max-replacement',
              statusReason: 'Killed by first test',
              status: MutantStatus.Killed,
              location: loc(1, 11, 1, 12),
            }),
          ],
          source: srcAddContent,
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    expect(actualDiff).deep.eq(mutants);
  });

  it('should not copy the status if the mutant has a different replacement', () => {
    // Arrange
    const currentFiles = new Map([[srcAdd, srcAddContent]]);
    const mutants = [createMutant({ id: '1', fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) })];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              replacement: 'other replacement',
              mutatorName: 'min-replacement',
              status: MutantStatus.Killed,
              location: loc(1, 11, 1, 12),
            }),
          ],
          source: srcAddContent,
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    expect(actualDiff).deep.eq(mutants);
  });

  it('should not copy the status if the mutant has a different location', () => {
    // Arrange
    const currentFiles = new Map([[srcAdd, srcAddContent]]);
    const mutants = [createMutant({ id: '1', fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) })];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              replacement: '-',
              mutatorName: 'min-replacement',
              status: MutantStatus.Killed,
              location: loc(2, 11, 2, 12),
            }),
          ],
          source: srcAddContent,
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    expect(actualDiff).deep.eq(mutants);
  });

  it('should not copy the status if the mutant has a different file name', () => {
    // Arrange
    const currentFiles = new Map([[srcAdd, srcAddContent]]);
    const mutants = [createMutant({ id: '1', fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) })];
    const incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        ['src/some-other-file.js']: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              replacement: '-',
              mutatorName: 'min-replacement',
              status: MutantStatus.Killed,
              location: loc(1, 11, 1, 12),
            }),
          ],
          source: srcAddContent,
        }),
      },
    });
    const sut = new IncrementalDiffer(incrementalReport, currentFiles, testInjector.logger);

    // Act
    const actualDiff = sut.diff(mutants);

    // Assert
    expect(actualDiff).deep.eq(mutants);
  });

  function loc(startLine: number, startColumn: number, endLine: number, endColumn: number): Location {
    return { start: { line: startLine, column: startColumn }, end: { line: endLine, column: endColumn } };
  }

  function arrangeFullReport(): MutationTestResult {
    return factory.mutationTestReportSchemaMutationTestResult({
      files: {
        [srcAdd]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '1',
              coveredBy: ['1'],
              killedBy: ['1'],
              replacement: '-',
              mutatorName: 'min-replacement',
              statusReason: 'Killed by first test',
              testsCompleted: 2,
              status: MutantStatus.Killed,
              location: { start: { line: 1, column: 11 }, end: { line: 1, column: 12 } },
            }),
          ],
          source: srcAddContent,
        }),
        [srcMultiply]: factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: '2',
              coveredBy: ['2'],
              killedBy: ['2'],
              replacement: '/',
              statusReason: 'Killed by second test',
              mutatorName: 'divide-replacement',
              status: MutantStatus.Killed,
              testsCompleted: 1,
              location: { start: { line: 1, column: 11 }, end: { line: 1, column: 12 } },
            }),
          ],
          source: srcMultiplyContent,
        }),
      },
      testFiles: {
        [testAdd]: factory.mutationTestReportSchemaTestFile({
          source: testAddContent,
          tests: [
            factory.mutationTestReportSchemaTestDefinition({
              id: '1',
              name: 'add should result in 42 for 2 and 40',
              location: { start: { line: 4, column: 2 } },
            }),
          ],
        }),
        [testMultiply]: factory.mutationTestReportSchemaTestFile({
          source: testMultiplyContent,
          tests: [
            factory.mutationTestReportSchemaTestDefinition({
              id: '2',
              name: 'multiply should result in 42 for 21 and 2',
              location: { start: { line: 4, column: 2 } },
            }),
          ],
        }),
      },
    });
  }
});
