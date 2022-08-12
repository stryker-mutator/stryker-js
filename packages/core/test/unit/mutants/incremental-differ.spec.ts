import { Mutant, MutantStatus, schema } from '@stryker-mutator/api/core';
import { TestResult } from '@stryker-mutator/api/test-runner';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { IncrementalDiffer } from '../../../src/mutants/index.js';
import { createMutant, loc, pos } from '../../helpers/producers.js';

// Keep this files here for the indenting
const srcAddContent = `export function add(a, b) {
  return a + b;
}            
`;
const testAddContent = `import { expect } from 'chai';
import { add } from '../src/add.js';

describe('add' () => {
  it('should result in 42 for 2 and 40', () => {
    expect(add(40, 2)).eq(42);
  });
});
`;
const testAddContentTwoTests = `import { expect } from 'chai';
import { add } from '../src/add.js';

describe('add' () => {
  it('should result in 42 for 2 and 40', () => {
    expect(add(40, 2)).eq(42);
  });
  it('should result in 42 for 45 and -3', () => {
    expect(add(45, -3)).eq(42);
  });
});
`;
const testAddContentWithTestGeneration = `import { expect } from 'chai';
import { add } from '../src/add.js';

describe('add' () => {
  for(const [a, b, answer] of [[40, 2, 42], [45, -3, 42]]) {
    it(\`should result in \${answer} for \${a} and \${b}\`, () => {
      expect(add(a, b)).eq(answer);
    });
  }
  it('should have name "add"', () => {
    expect(add.name).eq('add');
  });
});
`;

const testAddContentWithTestGenerationUpdated = `import { expect } from 'chai';
import { add } from '../src/add.js';

describe('add' () => {
  for(const [a, b, answer] of [[40, 2, 42], [45, -3, 42]]) {
    it(\`should result in \${answer} for \${a} and \${b}\`, () => {
      expect(add(a, b)).eq(answer);
    });
  }
  it('should have name "add"', () => {
    // Add a comment as change
    expect(add.name).eq('add');
  });
});
`;

const srcAdd = 'src/add.js';
const testAdd = 'test/add.spec.js';

class ScenarioBuilder {
  public readonly oldSpecId = 'spec-1';
  public readonly newTestId = 'new-spec-2';
  public readonly mutantId = '2';

  public incrementalFiles: schema.FileResultDictionary = {};
  public incrementalTestFiles: schema.TestFileDefinitionDictionary = {};
  public currentFiles = new Map<string, string>();
  public mutants: Mutant[] = [];
  public tests = new Map<string, Set<TestResult>>();
  public sut?: IncrementalDiffer;

  public withMathProjectExample({ mutantState: mutantStatus = MutantStatus.Killed } = {}): this {
    this.mutants.push(
      createMutant({ id: this.mutantId, fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) })
    );
    this.incrementalFiles[srcAdd] = factory.mutationTestReportSchemaFileResult({
      mutants: [
        factory.mutationTestReportSchemaMutantResult({
          id: 'mut-1',
          coveredBy: [this.oldSpecId],
          killedBy: [this.oldSpecId],
          replacement: '-',
          mutatorName: 'min-replacement',
          statusReason: 'Killed by first test',
          testsCompleted: 1,
          status: mutantStatus,
          location: loc(1, 11, 1, 12),
        }),
      ],
      source: srcAddContent,
    });
    this.incrementalTestFiles[testAdd] = factory.mutationTestReportSchemaTestFile({
      tests: [{ id: this.oldSpecId, name: 'add(2, 0) = 2' }],
    });
    this.currentFiles.set(srcAdd, srcAddContent);
    this.tests.set(this.mutantId, new Set([factory.testResult({ id: this.newTestId, fileName: testAdd, name: 'add(2, 0) = 2' })]));
    return this;
  }

  public withTestFile(): this {
    this.currentFiles.set(testAdd, testAddContent);
    this.incrementalTestFiles[testAdd].source = testAddContent;
    return this;
  }

  public withLocatedTest({ includeEnd = false } = {}): this {
    this.incrementalTestFiles[testAdd].tests[0].location = loc(4, 2);
    if (includeEnd) {
      this.incrementalTestFiles[testAdd].tests[0].location.end = pos(6, 5);
    }
    [...this.tests.get(this.mutantId)!][0].startPosition = pos(4, 2);
    return this;
  }

  public withAddedLinesAboveTest(...lines: string[]): this {
    this.currentFiles.set(testAdd, `${lines.join('\n')}\n${testAddContent}`);
    for (const test of this.tests.get(this.mutantId)!) {
      if (test.startPosition) {
        test.startPosition = pos(4 + lines.length, 2);
      }
    }
    return this;
  }

  public withAddedLinesAboveMutant(...lines: string[]): this {
    this.currentFiles.set(srcAdd, `${lines.join('\n')}\n${srcAddContent}`);
    this.mutants[0].location = loc(1 + lines.length, 11, 1 + lines.length, 12);
    return this;
  }

  public withCrlfLineEndingsInIncrementalReport(): this {
    Object.values(this.incrementalFiles).forEach((file) => {
      file.source = file.source.replace(/\n/g, '\r\n');
    });
    Object.values(this.incrementalTestFiles).forEach((file) => {
      file.source = file.source?.replace(/\n/g, '\r\n');
    });
    return this;
  }

  public withRemovedLinesAboveMutant(...lines: string[]): this {
    this.incrementalFiles[srcAdd].source = `${lines.join('\n')}\n${srcAddContent}`;
    this.incrementalFiles[srcAdd].mutants[0].location = loc(1 + lines.length, 11, 1 + lines.length, 12);
    return this;
  }

  public withAddedTextBeforeMutant(text: string): this {
    this.currentFiles.set(
      srcAdd,
      srcAddContent
        .split('\n')
        .map((line, nr) => (nr === 1 ? `${text}${line}` : line))
        .join('\n')
    );
    this.mutants[0].location = loc(1, 11 + text.length, 1, 12 + text.length);
    return this;
  }

  public withAddedTextBeforeTest(text: string): this {
    this.currentFiles.set(
      testAdd,
      testAddContent
        .split('\n')
        .map((line, nr) => (nr === 4 ? `${text}${line}` : line))
        .join('\n')
    );
    for (const test of this.tests.get(this.mutantId)!) {
      if (test.startPosition) {
        test.startPosition = pos(4, 2 + text.length);
      }
    }
    return this;
  }

  public withAddedCodeInsideTheTest(code: string): this {
    this.currentFiles.set(
      testAdd,
      testAddContent
        .split('\n')
        .map((line, nr) => (nr === 5 ? `  ${code}\n${line}` : line))
        .join('\n')
    );
    for (const test of this.tests.get(this.mutantId)!) {
      if (test.startPosition) {
        test.startPosition = pos(4, 2);
      }
    }
    return this;
  }

  public withSecondTest({ located }: { located: boolean }): this {
    this.currentFiles.set(testAdd, testAddContentTwoTests);
    const secondTest = factory.testResult({ id: '2', fileName: testAdd, name: 'add(45, -3) = 42' });
    if (located) {
      secondTest.startPosition = pos(7, 2);
    }
    this.tests.get(this.mutantId)!.add(secondTest);
    return this;
  }
  public withSecondTestInIncrementalReport({ isKillingTest = false } = {}): this {
    this.incrementalTestFiles[testAdd].tests.unshift(
      factory.mutationTestReportSchemaTestDefinition({ id: '2', name: 'add(45, -3) = 42', location: loc(7, 0) })
    );
    if (isKillingTest) {
      this.incrementalFiles[srcAdd].mutants[0].killedBy = ['2'];
      this.incrementalFiles[srcAdd].mutants[0].coveredBy = ['2'];
    }
    if (this.incrementalTestFiles[testAdd].source) {
      this.incrementalTestFiles[testAdd].source = testAddContentTwoTests;
    }
    return this;
  }

  public withUpdatedTestGeneration(): this {
    this.currentFiles.set(testAdd, testAddContentWithTestGenerationUpdated);
    const createAddWithTestGenerationTestResult = (a: number, b: number, answer: number) =>
      factory.testResult({ fileName: testAdd, name: `should result in ${answer} for ${a} and ${b}`, startPosition: pos(5, 4) });

    this.tests.get(this.mutantId)!.clear();
    this.tests
      .get(this.mutantId)!
      .add(factory.testResult({ id: 'new-spec-2', fileName: testAdd, name: 'should have name "add"', startPosition: pos(9, 2) }));
    this.tests.get(this.mutantId)!.add(createAddWithTestGenerationTestResult(40, 2, 42));
    this.tests.get(this.mutantId)!.add(createAddWithTestGenerationTestResult(45, -3, 42));
    return this;
  }
  public withTestGenerationIncrementalReport(): this {
    this.incrementalTestFiles[testAdd].source = testAddContentWithTestGeneration;
    const createAddWithTestGenerationTestDefinition = (id: string, a: number, b: number, answer: number) =>
      factory.mutationTestReportSchemaTestDefinition({
        id,
        name: `should result in ${answer} for ${a} and ${b}`,
        location: loc(5, 4),
      });
    while (this.incrementalTestFiles[testAdd].tests.shift()) {}
    this.incrementalTestFiles[testAdd].tests.push(
      factory.mutationTestReportSchemaTestDefinition({ id: 'spec3', name: 'should have name "add"', location: loc(9, 2) }),
      createAddWithTestGenerationTestDefinition('spec4', 40, 2, 42),
      createAddWithTestGenerationTestDefinition('spec5', 45, -3, 42)
    );
    this.incrementalFiles[srcAdd].mutants[0].coveredBy = ['spec4', 'spec5'];
    this.incrementalFiles[srcAdd].mutants[0].killedBy = ['spec4'];
    return this;
  }

  public withRemovedTextBeforeMutant(text: string): this {
    this.incrementalFiles[srcAdd].source = srcAddContent
      .split('\n')
      .map((line, nr) => (nr === 1 ? `${text}${line}` : line))
      .join('\n');
    this.incrementalFiles[srcAdd].mutants[0].location = loc(1, 11 + text.length, 1, 12 + text.length);
    return this;
  }

  public withAddedTextAfterTest(text: string): this {
    const cnt = testAddContent
      .split('\n')
      .map((line, nr) => `${line}${nr === 6 ? text : ''}`)
      .join('\n');
    this.currentFiles.set(testAdd, cnt);
    return this;
  }

  public withChangedMutantText(replacement: string): this {
    this.currentFiles.set(srcAdd, srcAddContent.replace('+', replacement));
    return this;
  }

  public withDifferentMutator(mutatorName: string): this {
    this.mutants[0].mutatorName = mutatorName;
    return this;
  }

  public withDifferentReplacement(replacement: string): this {
    this.mutants[0].replacement = replacement;
    return this;
  }

  public withDifferentMutantLocation(): this {
    this.incrementalFiles[srcAdd].mutants[0].location = loc(2, 11, 2, 12);
    return this;
  }

  public withDifferentFileName(fileName: string): this {
    this.incrementalFiles[fileName] = this.incrementalFiles[srcAdd];
    delete this.incrementalFiles[srcAdd];
    return this;
  }

  public act() {
    this.sut = new IncrementalDiffer(testInjector.logger);
    return this.sut.diff(
      this.mutants,
      this.tests,
      factory.mutationTestReportSchemaMutationTestResult({
        files: this.incrementalFiles,
        testFiles: this.incrementalTestFiles,
      }),
      this.currentFiles
    );
  }
}

describe(IncrementalDiffer.name, () => {
  describe('mutant changes', () => {
    it('should copy status, statusReason, testsCompleted if nothing changed', () => {
      // Arrange
      const actualDiff = new ScenarioBuilder().withMathProjectExample().act();

      // Assert
      const actualMutant = actualDiff[0];
      const expected: Partial<Mutant> = {
        id: '2',
        fileName: srcAdd,
        replacement: '-',
        mutatorName: 'min-replacement',
        location: loc(1, 11, 1, 12),
        status: MutantStatus.Killed,
        statusReason: 'Killed by first test',
        testsCompleted: 1,
      };
      expect(actualMutant).deep.contains(expected);
    });

    it('should normalize line endings when comparing diffs', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample()
        .withTestFile()
        .withLocatedTest()
        .withCrlfLineEndingsInIncrementalReport()
        .act();

      const actualMutant = actualDiff[0];
      expect(actualMutant.status).eq(MutantStatus.Killed);
    });

    it('should map killedBy and coveredBy to the new test ids if a mutant result is reused', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample();
      const actualDiff = scenario.act();
      const actualMutant = actualDiff[0];
      const expectedTestIds = [scenario.newTestId];
      const expected: Partial<Mutant> = {
        coveredBy: expectedTestIds,
        killedBy: expectedTestIds,
      };
      expect(actualMutant).deep.contains(expected);
    });

    it("should identify that a mutant hasn't changed if lines got added above", () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withAddedLinesAboveMutant("import path from 'path';", '', '').act();
      expect(actualDiff[0].status).eq(MutantStatus.Killed);
    });

    it("should identify that a mutant hasn't changed if characters got added before", () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withAddedTextBeforeMutant("/* text added this shouldn't matter */").act();
      expect(actualDiff[0].status).eq(MutantStatus.Killed);
    });

    it("should identify that a mutant hasn't changed if lines got removed above", () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withRemovedLinesAboveMutant('import path from "path";', '').act();
      expect(actualDiff[0].status).eq(MutantStatus.Killed);
    });

    it("should identify that a mutant hasn't changed if characters got removed before", () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withRemovedTextBeforeMutant("/* text removed, this shouldn't matter*/").act();
      expect(actualDiff[0].status).eq(MutantStatus.Killed);
    });

    it('should not reuse the status of a mutant in changed text', () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withChangedMutantText('*').act();
      expect(actualDiff[0].status).undefined;
    });

    it('should not copy the status if the mutant came from a different mutator', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withDifferentMutator('max-replacement');
      const actualDiff = scenario.act();
      expect(actualDiff).deep.eq(scenario.mutants);
    });

    it('should not copy the status if the mutant has a different replacement', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withDifferentReplacement('other replacement');
      const actualDiff = scenario.act();
      expect(actualDiff).deep.eq(scenario.mutants);
    });

    it('should not copy the status if the mutant has a different location', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withDifferentMutantLocation();
      const actualDiff = scenario.act();
      expect(actualDiff).deep.eq(scenario.mutants);
    });

    it('should not copy the status if the mutant has a different file name', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withDifferentFileName('src/some-other-file.js');
      const actualDiff = scenario.act();
      expect(actualDiff).deep.eq(scenario.mutants);
    });

    it('should collect 1 added mutant and 1 removed mutant if the mutant changed', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withChangedMutantText('*');
      scenario.act();
      expect(scenario.sut!.mutantStatisticsCollector!.changesByFile).lengthOf(1);
      const changes = scenario.sut!.mutantStatisticsCollector!.changesByFile.get(srcAdd)!;
      expect(changes).property('added', 1);
      expect(changes).property('removed', 1);
    });

    it('should collect the removed mutants if the file got removed', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withDifferentFileName('src/some-other-file.js');
      scenario.act();
      expect(scenario.sut!.mutantStatisticsCollector!.changesByFile).lengthOf(2);
      const changesOldFile = scenario.sut!.mutantStatisticsCollector!.changesByFile.get('src/some-other-file.js')!;
      const changesNewFile = scenario.sut!.mutantStatisticsCollector!.changesByFile.get(srcAdd)!;
      expect(changesNewFile).property('added', 1);
      expect(changesNewFile).property('removed', 0);
      expect(changesOldFile).property('added', 0);
      expect(changesOldFile).property('removed', 1);
    });
    
    it('should log  1 added mutant and 1 removed mutant if the mutant changed', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withChangedMutantText('*');
      scenario.act();
      expect(scenario.sut!.mutantStatisticsCollector!.changesByFile).lengthOf(1);
      const changes = scenario.sut!.mutantStatisticsCollector!.changesByFile.get(srcAdd)!;
      expect(changes).property('added', 1);
      expect(changes).property('removed', 1);
    });

  });

  describe('test changes', () => {
    it('should identify that a mutant state can be reused when no tests changed', () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withTestFile().act();
      expect(actualDiff[0].status).eq(MutantStatus.Killed);
    });

    describe('with test file changes', () => {
      it('should identify that mutant state can be reused with changes above', () => {
        const actualDiff = new ScenarioBuilder()
          .withMathProjectExample()
          .withTestFile()
          .withLocatedTest()
          .withAddedLinesAboveTest("import foo from 'bar'", '')
          .act();

        // Assert
        expect(actualDiff[0].status).eq(MutantStatus.Killed);
      });

      it('should identify that mutant state can be reused with changes before', () => {
        const actualDiff = new ScenarioBuilder()
          .withMathProjectExample()
          .withTestFile()
          .withLocatedTest()
          .withAddedTextBeforeTest('/*text-added*/')
          .act();
        expect(actualDiff[0].status).eq(MutantStatus.Killed);
      });

      it('should identify that mutant state can be reused with changes below', () => {
        const actualDiff = new ScenarioBuilder()
          .withMathProjectExample()
          .withTestFile()
          .withLocatedTest({ includeEnd: true })
          .withSecondTest({ located: true })
          .act();
        expect(actualDiff[0].status).eq(MutantStatus.Killed);
      });

      it('should identify that mutant state can be reused with changes behind', () => {
        const actualDiff = new ScenarioBuilder()
          .withMathProjectExample()
          .withTestFile()
          .withLocatedTest({ includeEnd: true })
          .withAddedTextAfterTest('/*text-added*/')
          .act();
        expect(actualDiff[0].status).eq(MutantStatus.Killed);
      });

      it('should not reuse a mutant state when a covering test gets code added', () => {
        const actualDiff = new ScenarioBuilder()
          .withMathProjectExample()
          .withTestFile()
          .withLocatedTest({ includeEnd: true })
          .withAddedCodeInsideTheTest('addedText();')
          .act();
        expect(actualDiff[0].status).undefined;
      });

      it('should close locations of tests in the incremental report', () => {
        // All test runners currently only report the start positions of tests.
        // Add a workaround for 'inventing' the end position based on the next test's start position.
        const actualDiff = new ScenarioBuilder()
          .withMathProjectExample()
          .withTestFile()
          .withLocatedTest({ includeEnd: true })
          .withSecondTest({ located: true })
          .withSecondTestInIncrementalReport()
          .act();
        expect(actualDiff[0].status).eq(MutantStatus.Killed);
      });

      it('should close locations for tests on the same location in the incremental report', () => {
        // Test cases can generate tests, make sure the correct end position is chosen in those cases
        const actualDiff = new ScenarioBuilder().withMathProjectExample().withUpdatedTestGeneration().withTestGenerationIncrementalReport().act();
        expect(actualDiff[0].status).eq(MutantStatus.Killed);
      });
    });

    it('should identify that a non-"Killed" state can be reused when a test is removed', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample({ mutantState: MutantStatus.Survived })
        .withSecondTestInIncrementalReport()
        .act();
      expect(actualDiff[0].status).eq(MutantStatus.Survived);
    });

    it('should identify that a non-"Killed" state cannot be reused when a test is added', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample({ mutantState: MutantStatus.Survived })
        .withSecondTest({ located: false })
        .act();
      expect(actualDiff[0].status).undefined;
    });

    it('should identify that a "Killed" state can be reused when the killing test didn\'t change', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample({ mutantState: MutantStatus.Killed })
        .withTestFile()
        .withLocatedTest()
        .withSecondTestInIncrementalReport()
        .act();
      expect(actualDiff[0].status).eq(MutantStatus.Killed);
    });

    it('should identify that a "Killed" state cannot be reused when the killing test was removed', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample({ mutantState: MutantStatus.Killed })
        .withTestFile()
        .withSecondTestInIncrementalReport({ isKillingTest: true })
        .act();
      expect(actualDiff[0].status).undefined;
    });
  });
});
