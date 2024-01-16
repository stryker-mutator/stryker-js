import path from 'path';

import { Mutant, MutantStatus, schema } from '@stryker-mutator/api/core';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { deepFreeze } from '@stryker-mutator/util';
import { expect } from 'chai';
import chalk from 'chalk';
import sinon from 'sinon';

import { IncrementalDiffer } from '../../../src/mutants/index.js';
import { createMutant, loc, pos } from '../../helpers/producers.js';
import { TestCoverageTestDouble } from '../../helpers/test-coverage-test-double.js';

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
const testAddContentWithTestGenerationAndAdditionalTest = `import { expect } from 'chai';
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

const testAddContentWithTestGeneration = `import { add } from '../add.js';

test.each\`
  x    | y    | expected
  ${1} | ${1} | ${2}
  ${1} | ${2} | ${3}
  ${2} | ${2} | ${4}
\`("add($x, $y) = $expected", ({ x, y, expected }) => {
  expect(add(x, y)).toBe(expected);
});`;

const testAddContentWithTestGenerationAndAdditionalTestUpdated = `import { expect } from 'chai';
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

const srcMultiplyContent = `export function multiply(a, b) {
  return a * b;
}`;
const testMultiplyContent = `import { expect } from 'chai';
import { multiply } from '../src/multiply.js';

describe('multiply' () => {
  it('should result in 42 for 2 and 21', () => {
    expect(multiply(2, 21)).eq(42);
  });
});
`;

const srcAdd = 'src/add.js';
const srcMultiply = 'src/multiply.js';
const testAdd = 'test/add.spec.js';
const testMultiply = 'test/multiply.spec.js';

class ScenarioBuilder {
  public readonly oldSpecId = 'spec-1';
  public readonly newTestId = 'new-spec-2';
  public readonly mutantId = '2';

  public incrementalFiles: schema.FileResultDictionary = {};
  public incrementalTestFiles: schema.TestFileDefinitionDictionary = {};
  public currentFiles = new Map<string, string>();
  public mutants: Mutant[] = [];
  public testCoverage = new TestCoverageTestDouble();
  public sut?: IncrementalDiffer;

  public withMathProjectExample({ mutantState: mutantStatus = 'Killed', isStatic = false } = {}): this {
    this.mutants.push(
      createMutant({ id: this.mutantId, fileName: srcAdd, replacement: '-', mutatorName: 'min-replacement', location: loc(1, 11, 1, 12) }),
    );
    this.incrementalFiles[srcAdd] = factory.mutationTestReportSchemaFileResult({
      mutants: [
        factory.mutationTestReportSchemaMutantResult({
          id: 'mut-1',
          coveredBy: isStatic ? undefined : [this.oldSpecId],
          killedBy: [this.oldSpecId],
          replacement: '-',
          mutatorName: 'min-replacement',
          statusReason: 'Killed by first test',
          testsCompleted: 1,
          status: mutantStatus as MutantStatus,
          location: loc(1, 11, 1, 12),
        }),
      ],
      source: srcAddContent,
    });
    this.incrementalTestFiles[testAdd] = factory.mutationTestReportSchemaTestFile({
      tests: [{ id: this.oldSpecId, name: 'add(2, 0) = 2' }],
      source: testAddContent,
    });
    this.currentFiles.set(srcAdd, srcAddContent);
    this.currentFiles.set(testAdd, testAddContent);
    this.testCoverage.addTest(factory.testResult({ id: this.newTestId, fileName: testAdd, name: 'add(2, 0) = 2' }));

    if (isStatic) {
      this.testCoverage.hasCoverage = true;
      this.testCoverage.staticCoverage[this.mutantId] = true;
    } else {
      this.testCoverage.addCoverage(this.mutantId, [this.newTestId]);
    }
    return this;
  }

  public withoutTestCoverage(): this {
    Object.keys(this.incrementalTestFiles).forEach((testFile) => delete this.incrementalTestFiles[testFile]);
    this.testCoverage.clear();
    this.testCoverage.hasCoverage = false;
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
    [...this.testCoverage.forMutant(this.mutantId)!][0].startPosition = pos(4, 2);
    return this;
  }

  public withAddedLinesAboveTest(...lines: string[]): this {
    this.currentFiles.set(testAdd, `${lines.join('\n')}\n${testAddContent}`);
    for (const test of this.testCoverage.forMutant(this.mutantId)!) {
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
        .join('\n'),
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
        .join('\n'),
    );
    for (const test of this.testCoverage.forMutant(this.mutantId)!) {
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
        .join('\n'),
    );
    for (const test of this.testCoverage.forMutant(this.mutantId)!) {
      if (test.startPosition) {
        test.startPosition = pos(4, 2);
      }
    }
    return this;
  }

  public withSecondTest({ located }: { located: boolean }): this {
    this.currentFiles.set(testAdd, testAddContentTwoTests);
    const secondTest = factory.testResult({ id: 'spec2', fileName: testAdd, name: 'add(45, -3) = 42' });
    if (located) {
      secondTest.startPosition = pos(7, 2);
    }
    this.testCoverage.addTest(secondTest);
    this.testCoverage.addCoverage(this.mutantId, [secondTest.id]);
    return this;
  }

  public withSecondTestInIncrementalReport({ isKillingTest = false } = {}): this {
    this.currentFiles.set(testAdd, testAddContentTwoTests);
    this.incrementalTestFiles[testAdd].tests.unshift(
      factory.mutationTestReportSchemaTestDefinition({ id: 'spec2', name: 'add(45, -3) = 42', location: loc(7, 0) }),
    );
    if (isKillingTest) {
      this.incrementalFiles[srcAdd].mutants[0].killedBy = ['spec2'];
    }
    if (this.incrementalTestFiles[testAdd].source) {
      this.incrementalTestFiles[testAdd].source = testAddContentTwoTests;
    }
    return this;
  }

  public withTestGeneration(): this {
    this.currentFiles.set(testAdd, testAddContentWithTestGeneration);
    const generateTest = (id: string, a: number, b: number, answer: number) =>
      factory.testResult({ id, fileName: testAdd, name: `add(${a}, ${b}) = ${answer}`, startPosition: pos(8, 3) });

    this.testCoverage.clear();
    this.testCoverage.addTest(generateTest('spec1', 1, 1, 2), generateTest('spec2', 1, 2, 3), generateTest('spec3', 2, 2, 4));
    this.testCoverage.addCoverage(this.mutantId, ['spec1', 'spec2', 'spec3']);
    return this;
  }

  public withTestGenerationIncrementalReport(): this {
    this.incrementalTestFiles[testAdd].source = testAddContentWithTestGeneration;
    const generateTest = (id: string, a: number, b: number, answer: number) =>
      factory.mutationTestReportSchemaTestDefinition({
        id,
        name: `add(${a}, ${b}) = ${answer}`,
        location: loc(8, 3),
      });
    // clear all tests
    while (this.incrementalTestFiles[testAdd].tests.shift()) {}
    this.incrementalTestFiles[testAdd].tests.push(generateTest('spec4', 1, 1, 2), generateTest('spec5', 1, 2, 3), generateTest('spec6', 2, 2, 4));
    this.incrementalFiles[srcAdd].mutants[0].coveredBy = ['spec4', 'spec5', 'spec6'];
    this.incrementalFiles[srcAdd].mutants[0].killedBy = ['spec4'];
    return this;
  }

  public withTestGenerationAndAdditionalTest(): this {
    this.currentFiles.set(testAdd, testAddContentWithTestGenerationAndAdditionalTest);
    const createAddWithTestGenerationTestResult = (a: number, b: number, answer: number) =>
      factory.testResult({ id: `spec${a}`, fileName: testAdd, name: `should result in ${answer} for ${a} and ${b}`, startPosition: pos(5, 4) });

    this.testCoverage.clear();
    this.testCoverage.addTest(factory.testResult({ id: 'new-spec-2', fileName: testAdd, name: 'should have name "add"', startPosition: pos(9, 2) }));
    const gen1 = createAddWithTestGenerationTestResult(40, 2, 42);
    const gen2 = createAddWithTestGenerationTestResult(45, -3, 42);
    this.testCoverage.addTest(gen1, gen2);
    this.testCoverage.addCoverage(this.mutantId, ['new-spec-2', gen1.id, gen2.id]);
    return this;
  }

  public withUpdatedTestGenerationAndAdditionalTest(): this {
    this.currentFiles.set(testAdd, testAddContentWithTestGenerationAndAdditionalTestUpdated);
    const createAddWithTestGenerationTestResult = (a: number, b: number, answer: number) =>
      factory.testResult({ id: `spec${a}`, fileName: testAdd, name: `should result in ${answer} for ${a} and ${b}`, startPosition: pos(5, 4) });

    this.testCoverage.clear();
    this.testCoverage.addTest(factory.testResult({ id: 'new-spec-2', fileName: testAdd, name: 'should have name "add"', startPosition: pos(9, 2) }));
    const gen1 = createAddWithTestGenerationTestResult(40, 2, 42);
    const gen2 = createAddWithTestGenerationTestResult(45, -3, 42);
    this.testCoverage.addTest(gen1, gen2);
    this.testCoverage.addCoverage(this.mutantId, ['new-spec-2', gen1.id, gen2.id]);
    return this;
  }

  public withTestGenerationAndAdditionalTestIncrementalReport(): this {
    this.incrementalTestFiles[testAdd].source = testAddContentWithTestGenerationAndAdditionalTest;
    const createAddWithTestGenerationTestDefinition = (id: string, a: number, b: number, answer: number) =>
      factory.mutationTestReportSchemaTestDefinition({
        id,
        name: `should result in ${answer} for ${a} and ${b}`,
        location: loc(5, 4),
      });
    // clear all tests
    while (this.incrementalTestFiles[testAdd].tests.shift()) {}
    this.incrementalTestFiles[testAdd].tests.push(
      factory.mutationTestReportSchemaTestDefinition({ id: 'spec3', name: 'should have name "add"', location: loc(9, 2) }),
      createAddWithTestGenerationTestDefinition('spec4', 40, 2, 42),
      createAddWithTestGenerationTestDefinition('spec5', 45, -3, 42),
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

  public withSecondSourceAndTestFileInIncrementalReport(): this {
    this.incrementalTestFiles[testMultiply] = factory.mutationTestReportSchemaTestFile({
      source: testMultiplyContent,
      tests: [
        factory.mutationTestReportSchemaTestDefinition({ id: 'spec-3', location: loc(4, 2), name: 'multiply should result in 42 for 2 and 21' }),
      ],
    });
    this.incrementalFiles[srcMultiply] = factory.mutationTestReportSchemaFileResult({
      mutants: [
        factory.mutationTestReportSchemaMutantResult({
          id: 'mut-3',
          coveredBy: ['spec-3'],
          killedBy: ['spec-3'],
          replacement: '/',
          testsCompleted: 1,
          status: 'Killed',
          location: loc(1, 11, 1, 12),
        }),
      ],
      source: srcMultiplyContent,
    });
    return this;
  }

  public withSecondSourceFile(): this {
    this.currentFiles.set(srcMultiply, srcMultiplyContent);
    return this;
  }
  public withSecondTestFile(): this {
    this.currentFiles.set(testMultiply, testMultiplyContent);
    return this;
  }

  public withRemovedTestFile(): this {
    this.currentFiles.delete(testAdd);
    this.testCoverage.clear();
    this.testCoverage.hasCoverage = false;
    return this;
  }

  public withEmptyFileNameTestFile(): this {
    this.incrementalTestFiles[''] = this.incrementalTestFiles[testAdd];
    delete this.incrementalTestFiles[testAdd];
    this.testCoverage.clear();
    this.testCoverage.addTest(factory.testResult({ id: this.newTestId, name: 'add(2, 0) = 2' }));
    this.testCoverage.addCoverage(this.mutantId, [this.newTestId]);
    return this;
  }

  public act() {
    this.sut = testInjector.injector.injectClass(IncrementalDiffer);
    deepFreeze(this.mutants); // make sure mutants aren't changed at all
    return this.sut.diff(
      this.mutants,
      this.testCoverage,
      factory.mutationTestReportSchemaMutationTestResult({
        files: this.incrementalFiles,
        testFiles: this.incrementalTestFiles,
      }),
      this.currentFiles,
    );
  }
}

describe(IncrementalDiffer.name, () => {
  describe('mutant changes', () => {
    it('should copy status, statusReason, testsCompleted if nothing changed', () => {
      // Arrange
      const actualDiff = new ScenarioBuilder().withMathProjectExample().act();

      // Assert
      const [actualMutant] = actualDiff;
      const expected: Partial<Mutant> = {
        id: '2',
        fileName: srcAdd,
        replacement: '-',
        mutatorName: 'min-replacement',
        location: loc(1, 11, 1, 12),
        status: 'Killed',
        statusReason: 'Killed by first test',
        testsCompleted: 1,
      };
      expect(actualMutant).deep.contains(expected);
    });

    it('should not reuse the result when --force is active', () => {
      // Arrange
      testInjector.options.force = true;
      const actualDiff = new ScenarioBuilder().withMathProjectExample().act();

      // Assert
      const [actualMutant] = actualDiff;
      expect(actualMutant.status).undefined;
    });

    it('should not reuse when the mutant was ignored', () => {
      // Arrange
      const actualDiff = new ScenarioBuilder().withMathProjectExample({ mutantState: 'Ignored' }).act();

      // Assert
      const [actualMutant] = actualDiff;
      expect(actualMutant.status).undefined;
    });

    it('should normalize line endings when comparing diffs', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample()
        .withTestFile()
        .withLocatedTest()
        .withCrlfLineEndingsInIncrementalReport()
        .act();

      const [actualMutant] = actualDiff;
      expect(actualMutant.status).eq('Killed');
    });

    it('should map killedBy and coveredBy to the new test ids if a mutant result is reused', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample();
      const actualDiff = scenario.act();
      const [actualMutant] = actualDiff;
      const expectedTestIds = [scenario.newTestId];
      const expected: Partial<Mutant> = {
        coveredBy: expectedTestIds,
        killedBy: expectedTestIds,
      };
      expect(actualMutant).deep.contains(expected);
    });

    it("should identify that a mutant hasn't changed if lines got added above", () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withAddedLinesAboveMutant("import path from 'path';", '', '').act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it("should identify that a mutant hasn't changed if characters got added before", () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withAddedTextBeforeMutant("/* text added this shouldn't matter */").act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it("should identify that a mutant hasn't changed if lines got removed above", () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withRemovedLinesAboveMutant('import path from "path";', '').act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it("should identify that a mutant hasn't changed if characters got removed before", () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withRemovedTextBeforeMutant("/* text removed, this shouldn't matter*/").act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should not reuse the status of a mutant in changed text', () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withChangedMutantText('*').act();
      expect(actualDiff[0].status).undefined;
    });

    it('should reuse the status when there is no test coverage', () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withoutTestCoverage().act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should reuse the status when there is a test with empty file name', () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withEmptyFileNameTestFile().act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should not copy the status if the mutant came from a different mutator', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withDifferentMutator('max-replacement');
      const actualDiff = scenario.act();
      expect(actualDiff[0]).deep.eq(scenario.mutants[0]);
    });

    it('should not copy the status if the mutant has a different replacement', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withDifferentReplacement('other replacement');
      const actualDiff = scenario.act();
      expect(actualDiff[0]).deep.eq(scenario.mutants[0]);
    });

    it('should not copy the status if the mutant has a different location', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withDifferentMutantLocation();
      const actualDiff = scenario.act();
      expect(actualDiff[0]).deep.eq(scenario.mutants[0]);
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

    it('should collect 1 added mutant and 1 removed mutant if a mutant changed', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withChangedMutantText('*');
      scenario.act();
      expect(scenario.sut!.mutantStatisticsCollector!.changesByFile).lengthOf(1);
      const changes = scenario.sut!.mutantStatisticsCollector!.changesByFile.get(srcAdd)!;
      expect(changes).property('added', 1);
      expect(changes).property('removed', 1);
    });

    it('should log an incremental report', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withChangedMutantText('*');
      testInjector.logger.isInfoEnabled.returns(true);
      scenario.act();
      const { mutantStatisticsCollector, testStatisticsCollector } = scenario.sut!;
      sinon.assert.calledWithExactly(
        testInjector.logger.info,
        `Incremental report:\n\tMutants:\t${mutantStatisticsCollector!.createTotalsReport()}` +
          `\n\tTests:\t\t${testStatisticsCollector!.createTotalsReport()}` +
          `\n\tResult:\t\t${chalk.yellowBright(0)} of 1 mutant result(s) are reused.`,
      );
    });

    it('should not log test diff when there is no test coverage', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withoutTestCoverage();
      testInjector.logger.isInfoEnabled.returns(true);
      scenario.act();
      const { mutantStatisticsCollector } = scenario.sut!;

      sinon.assert.calledWithExactly(
        testInjector.logger.info,
        `Incremental report:\n\tMutants:\t${mutantStatisticsCollector!.createTotalsReport()}` +
          `\n\tResult:\t\t${chalk.yellowBright(1)} of 1 mutant result(s) are reused.`,
      );
    });

    it('should log a detailed incremental report', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withChangedMutantText('*');
      testInjector.logger.isDebugEnabled.returns(true);
      scenario.act();
      const { mutantStatisticsCollector } = scenario.sut!;
      const lineSeparator = '\n\t\t';
      const detailedMutantSummary = `${lineSeparator}${mutantStatisticsCollector!.createDetailedReport().join(lineSeparator)}`;

      sinon.assert.calledWithExactly(
        testInjector.logger.debug,
        `Detailed incremental report:\n\tMutants: ${detailedMutantSummary}\n\tTests: ${lineSeparator}No changes`,
      );
    });

    it('should not log if logLevel "info" or "debug" aren\'t enabled', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withChangedMutantText('*');
      testInjector.logger.isInfoEnabled.returns(false);
      testInjector.logger.isDebugEnabled.returns(false);
      scenario.act();
      sinon.assert.notCalled(testInjector.logger.debug);
      sinon.assert.notCalled(testInjector.logger.info);
    });
  });

  describe('test changes', () => {
    it('should identify that a mutant state can be reused when no tests changed', () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withTestFile().act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should identify that mutant state can be reused with changes above', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample()
        .withTestFile()
        .withLocatedTest()
        .withAddedLinesAboveTest("import foo from 'bar'", '')
        .act();

      // Assert
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should identify that mutant state can be reused with changes before', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample()
        .withTestFile()
        .withLocatedTest()
        .withAddedTextBeforeTest('/*text-added*/')
        .act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should identify that mutant state can be reused with changes below', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample()
        .withTestFile()
        .withLocatedTest({ includeEnd: true })
        .withSecondTest({ located: true })
        .act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should identify that mutant state can be reused with changes behind', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample()
        .withTestFile()
        .withLocatedTest({ includeEnd: true })
        .withAddedTextAfterTest('/*text-added*/')
        .act();
      expect(actualDiff[0].status).eq('Killed');
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
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should close locations for tests on the same location in the incremental report', () => {
      // Test cases can generate tests, make sure the correct end position is chosen in those cases
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample()
        .withUpdatedTestGenerationAndAdditionalTest()
        .withTestGenerationAndAdditionalTestIncrementalReport()
        .act();
      expect(actualDiff[0].status).eq('Killed');
    });

    // See #3909
    it('should close locations for tests on the same location in the incremental report when they are the last tests', () => {
      // Test cases can generate tests, make sure the correct end position is chosen in those cases
      const actualDiff = new ScenarioBuilder().withMathProjectExample().withTestGeneration().withTestGenerationIncrementalReport().act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should identify that a non-"Killed" state can be reused when a test is removed', () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample({ mutantState: 'Survived' }).withSecondTestInIncrementalReport().act();
      expect(actualDiff[0].status).eq('Survived');
    });

    it('should identify that a non-"Killed" state cannot be reused when a test is added', () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample({ mutantState: 'Survived' }).withSecondTest({ located: false }).act();
      expect(actualDiff[0].status).undefined;
    });

    it('should identify that a "Killed" state can be reused when the killing test didn\'t change', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample({ mutantState: 'Killed' })
        .withTestFile()
        .withLocatedTest()
        .withSecondTestInIncrementalReport()
        .act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should identify that a "Killed" state cannot be reused when the killing test was removed', () => {
      const actualDiff = new ScenarioBuilder()
        .withMathProjectExample({ mutantState: 'Killed' })
        .withTestFile()
        .withSecondTestInIncrementalReport({ isKillingTest: true })
        .act();
      expect(actualDiff[0].status).undefined;
    });

    it('should identify that a "Killed" state for a static mutant (no covering tests) can be reused when the killing test didn\'t change', () => {
      const actualDiff = new ScenarioBuilder().withMathProjectExample({ mutantState: 'Killed', isStatic: true }).act();
      expect(actualDiff[0].status).eq('Killed');
    });

    it('should collect an added test', () => {
      const scenario = new ScenarioBuilder()
        .withMathProjectExample()
        .withTestFile()
        .withLocatedTest({ includeEnd: true })
        .withSecondTest({ located: true });
      scenario.act();
      const actualCollector = scenario.sut!.testStatisticsCollector!;
      expect(actualCollector.changesByFile).lengthOf(1);
      const changes = actualCollector.changesByFile.get(testAdd)!;
      expect(changes).property('added', 1);
      expect(changes).property('removed', 0);
    });

    it('should collect a removed test', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withRemovedTestFile();
      scenario.act();
      const actualCollector = scenario.sut!.testStatisticsCollector!;
      expect(actualCollector.changesByFile).lengthOf(1);
      const changes = actualCollector.changesByFile.get(testAdd)!;
      expect(changes).property('added', 0);
      expect(changes).property('removed', 1);
      sinon.assert.calledWithExactly(testInjector.logger.debug, 'Test file removed: %s', testAdd);
    });

    it('should collect an added and removed test when a test changes', () => {
      const scenario = new ScenarioBuilder()
        .withMathProjectExample()
        .withTestFile()
        .withLocatedTest()
        .withAddedCodeInsideTheTest('arrangeSomething()');
      scenario.act();
      const actualCollector = scenario.sut!.testStatisticsCollector!;
      expect(actualCollector.changesByFile).lengthOf(1);
      const changes = actualCollector.changesByFile.get(testAdd)!;
      expect(changes).property('added', 1);
      expect(changes).property('removed', 1);
    });
  });

  describe('with history', () => {
    it('should keep historic mutants in other files', () => {
      const scenario = new ScenarioBuilder().withMathProjectExample().withSecondSourceAndTestFileInIncrementalReport().withSecondSourceFile();
      const mutants = scenario.act();
      expect(mutants).lengthOf(2);
      const [, actualMutant] = mutants;
      expect(actualMutant.id).includes('src/multiply.js@1:11-1:12');
      expect(actualMutant.status).eq('Killed');
      expect(actualMutant.fileName).eq(path.resolve(srcMultiply));
    });
    it("should keep historic tests that didn't run this time around", () => {
      const scenario = new ScenarioBuilder()
        .withMathProjectExample()
        .withSecondSourceAndTestFileInIncrementalReport()
        .withSecondSourceFile()
        .withSecondTestFile();
      const mutants = scenario.act();
      const actualTest = scenario.testCoverage.testsById.get(`${testMultiply}@4:2\nmultiply should result in 42 for 2 and 21`)!;
      expect(actualTest).ok;
      expect(actualTest.fileName).eq(path.resolve(testMultiply));
      expect(actualTest.name).eq('multiply should result in 42 for 2 and 21');
      expect(actualTest.startPosition).deep.eq(pos(4, 2));
      expect(scenario.testCoverage.forMutant(mutants[1].id)).deep.eq(new Set([actualTest]));
    });

    it('should not keep historic mutants when they are inside of a mutated file', () => {
      testInjector.fileDescriptions[path.resolve(srcMultiply)] = { mutate: true };
      const scenario = new ScenarioBuilder().withMathProjectExample().withSecondSourceAndTestFileInIncrementalReport().withSecondSourceFile();
      const mutants = scenario.act();
      expect(mutants).lengthOf(1);
    });

    it('should not keep historic mutants when they are inside of a mutated scope of a file', () => {
      testInjector.fileDescriptions[path.resolve(srcMultiply)] = { mutate: [loc(1, 11, 1, 12), loc(2, 2, 2, 3)] };
      const scenario = new ScenarioBuilder().withMathProjectExample().withSecondSourceAndTestFileInIncrementalReport().withSecondSourceFile();
      const mutants = scenario.act();
      expect(mutants).lengthOf(1);
    });

    it('should keep historic mutants when they are outside of a mutated scope of a file', () => {
      testInjector.fileDescriptions[path.resolve(srcMultiply)] = { mutate: [loc(1, 9, 1, 10), loc(2, 11, 2, 12)] };
      const scenario = new ScenarioBuilder().withMathProjectExample().withSecondSourceAndTestFileInIncrementalReport().withSecondSourceFile();
      const mutants = scenario.act();
      expect(mutants).lengthOf(2);
    });
  });
});
