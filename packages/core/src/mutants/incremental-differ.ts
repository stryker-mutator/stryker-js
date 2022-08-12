import path from 'path';

import { diffChars, Change } from 'diff';
import chalk from 'chalk';
import { schema, Mutant, Position, Location, MutantStatus } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { TestResult } from '@stryker-mutator/api/test-runner';
import { normalizeFileName, normalizeLineEndings, notEmpty } from '@stryker-mutator/util';

/**
 * This class is responsible for calculating the diff between a run and a previous run based on the incremental report.
 *
 * Since the ids of tests and mutants can differ across reports (they are only unique within 1 report), this class
 * identifies mutants and tests by attributes that make them unique:
 * - Mutant: file name, mutator name, location and replacement
 * - Test: test name, test file name (if present) and location (if present).
 *
 * A mutant result from the previous run is reused if the following conditions were met:
 * - The location of the mutant refers to a piece of code that didn't change
 * - If mutant was killed:
 *   - The culprit test wasn't changed
 * - If the mutant survived:
 *   - No test was added
 *
 * It uses the diff package to offset locations for tests and mutants, see link.
 * @see https://npmjs.com/package/diff
 */
export class IncrementalDiffer {
  // We should introduce mutant key and test key as a record in the future
  // @see https://github.com/tc39/proposal-record-tuple

  public mutantStatisticsCollector: DiffStatisticsCollector | undefined;
  public testStatisticsCollector: DiffStatisticsCollector | undefined;

  constructor(private readonly logger: Logger) {}

  public diff(
    currentMutants: readonly Mutant[],
    currentTestsByMutantId: Map<string, Set<TestResult>>,
    incrementalReport: schema.MutationTestResult,
    currentFiles: Map<string, string>
  ): readonly Mutant[] {
    const { files, testFiles } = incrementalReport;
    let reuseCount = 0;
    const oldTestCoverageByMutantKey = new Map<string, Set<string>>();
    const oldTestKilledByMutantKey = new Map<string, Set<string>>();
    const mutantStatisticsCollector = new DiffStatisticsCollector();
    const testStatisticsCollector = new DiffStatisticsCollector();

    // Expose the collectors for unit testing purposes
    this.mutantStatisticsCollector = mutantStatisticsCollector;
    this.testStatisticsCollector = testStatisticsCollector;

    // Figure out what we can reuse, while correcting for diff locations
    const reusableMutantsByKey = dissectReusableMutantsByKey();
    const testKeysByOldTestId = dissectReusableTestKeysByOldTestId();
    for (const [key, mutant] of reusableMutantsByKey) {
      oldTestCoverageByMutantKey.set(key, new Set(mutant.coveredBy?.map((testId) => testKeysByOldTestId.get(testId)).filter(notEmpty)));
      oldTestKilledByMutantKey.set(key, new Set(mutant.killedBy?.map((testId) => testKeysByOldTestId.get(testId)).filter(notEmpty)));
    }
    const oldTestKeys = new Set(testKeysByOldTestId.values());

    // Create a helper map to get info by new test id
    const testInfoByNewTestId = collectTestInfoByNewTestId();

    // Mark which tests are added
    for (const { key, relativeFileName } of testInfoByNewTestId.values()) {
      if (!oldTestKeys.has(key)) {
        testStatisticsCollector.count(relativeFileName, 'added');
      }
    }

    // Done with preparations, time to map over the mutants
    const result = currentMutants.map((mutant) => {
      if (!mutant.status) {
        const relativeFileName = toRelativeNormalizedFileName(mutant.fileName);
        const mutantKey = mutantToIdentifyingKey(mutant, relativeFileName);
        const oldMutant = reusableMutantsByKey.get(mutantKey);
        const coveringTests = currentTestsByMutantId.get(mutant.id);
        const testsDiff = diffTestCoverage(oldTestCoverageByMutantKey.get(mutantKey), coveringTests);
        const killedByTestKeys = oldTestKilledByMutantKey.get(mutantKey);
        if (oldMutant) {
          if (mutantCanBeReused(oldMutant, testsDiff, killedByTestKeys)) {
            reuseCount++;
            const { status, statusReason, testsCompleted } = oldMutant;
            return {
              ...mutant,
              status,
              statusReason,
              testsCompleted,
              coveredBy: coveringTests && [...coveringTests].map(({ id }) => id),
              killedBy:
                killedByTestKeys &&
                coveringTests &&
                [...coveringTests]
                  .map((test) => testInfoByNewTestId.get(test.id))
                  .filter(notEmpty)
                  .filter(({ key }) => killedByTestKeys.has(key))
                  .map(({ test: { id } }) => id),
            };
          }
        } else {
          mutantStatisticsCollector.count(relativeFileName, 'added');
        }
      }
      return mutant;
    });

    if (this.logger.isInfoEnabled()) {
      this.logger.info(
        `Incremental report:\n\tMutants:\t${mutantStatisticsCollector.createTotalsReport()}` +
          `\n\tTests:\t\t${testStatisticsCollector.createTotalsReport()}` +
          `\n\tResult:\t\t${chalk.yellowBright(reuseCount)} of ${currentMutants.length} mutant results are reused.`
      );
    }
    if (this.logger.isDebugEnabled()) {
      const lineSeparator = '\n\t\t';
      const detailedMutantSummary = `${lineSeparator}${mutantStatisticsCollector.createDetailedReport().join(lineSeparator) || 'No changes'}`;
      const detailedTestsSummary = `${lineSeparator}${testStatisticsCollector.createDetailedReport().join('\n\t\t') || 'No changes'}`;
      this.logger.debug(`Detailed incremental report:\n\tMutants\n\t\t${detailedMutantSummary}\n\tTests\n\t\t${detailedTestsSummary}`);
    }
    return result;

    function dissectReusableMutantsByKey() {
      return new Map(
        Object.entries(files).flatMap(([fileName, oldFile]) => {
          const relativeFileName = toRelativeNormalizedFileName(fileName);
          const currentFileSource = currentFiles.get(relativeFileName);
          if (currentFileSource) {
            const changes = diffChars(normalizeLineEndings(oldFile.source), normalizeLineEndings(currentFileSource));
            const { results, removeCount } = withUpdatedLocations(changes, oldFile.mutants);
            mutantStatisticsCollector.count(relativeFileName, 'removed', removeCount);
            return results.map((m) => [mutantToIdentifyingKey(m, relativeFileName), m]);
          }
          mutantStatisticsCollector.count(relativeFileName, 'removed', oldFile.mutants.length);
          // File is missing in the old project, cannot reuse these mutants
          return [];
        })
      );
    }

    function dissectReusableTestKeysByOldTestId() {
      return new Map(
        Object.entries(testFiles ?? {}).flatMap(([fileName, oldTestFile]) => {
          const relativeFileName = toRelativeNormalizedFileName(fileName);
          const currentFileSource = currentFiles.get(relativeFileName);
          if (currentFileSource !== undefined && oldTestFile.source !== undefined) {
            const changes = diffChars(normalizeLineEndings(oldTestFile.source), normalizeLineEndings(currentFileSource));
            const locatedTests = closeLocations(oldTestFile);
            const { results, removeCount } = withUpdatedLocations(changes, locatedTests);
            testStatisticsCollector.count(relativeFileName, 'removed', removeCount);
            return results.map((test) => [test.id, testToIdentifyingKey(test, relativeFileName)]);
          }
          // No sources to compare, we should do our best with the info we do have
          return oldTestFile.tests.map((test) => [test.id, testToIdentifyingKey(test, relativeFileName)]);
        })
      );
    }

    function collectTestInfoByNewTestId() {
      const map = new Map<string, { relativeFileName: string; test: TestResult; key: string }>();
      for (const testResults of currentTestsByMutantId.values()) {
        for (const testResult of testResults) {
          const relativeFileName = toRelativeNormalizedFileName(testResult.fileName);
          map.set(testResult.id, { relativeFileName, test: testResult, key: testToIdentifyingKey(testResult, relativeFileName) });
        }
      }

      return map;
    }
  }
}

/**
 * Updates the locations of mutants or tests based on the diff result.
 * @param changes The text changes (result of the diff tool)
 * @param items The mutants or tests to update locations for. These will be treated as immutable.
 * @returns A list of items with updated locations, without items that are changed
 */
function withUpdatedLocations<T extends { location: Location }>(changes: Change[], items: T[]): { results: T[]; removeCount: number } {
  const toDo = new Set(items.map((m) => ({ ...m, location: deepClone(m.location) })));
  const done: T[] = [];
  const currentPosition: Position = { column: 0, line: 0 };
  let removeCount = 0;
  for (const change of changes) {
    if (toDo.size === 0) {
      // There are more changes, but nothing left to update.
      break;
    }
    const offset = calculateOffset(change.value);
    if (change.added) {
      for (const test of toDo) {
        const { location } = test;
        if (gte(currentPosition, location.start) && gte(location.end, currentPosition)) {
          // This item cannot be reused, code was added here
          removeCount++;
          toDo.delete(test);
        } else {
          locationAdd(location, offset, currentPosition.line === location.start.line);
        }
      }
      positionMove(currentPosition, offset);
    } else if (change.removed) {
      for (const item of toDo) {
        const {
          location: { start },
        } = item;
        const endOffset = positionMove({ ...currentPosition }, offset);
        if (gte(endOffset, start)) {
          // This item cannot be reused, the code it covers has changed
          removeCount++;
          toDo.delete(item);
        } else {
          locationAdd(item.location, negate(offset), currentPosition.line === start.line);
        }
      }
    } else {
      positionMove(currentPosition, offset);
      toDo.forEach((item) => {
        const { end } = item.location;
        if (gte(currentPosition, end)) {
          // We're done with this item, it can be reused
          toDo.delete(item);
          done.push(item);
        }
      });
    }
  }
  done.push(...toDo);
  return { results: done, removeCount };
}

class DiffChanges {
  public added = 0;
  public removed = 0;
  public toString() {
    return `${chalk.red.greenBright(`+${this.added}`)} ${chalk.redBright(`-${this.removed}`)}`;
  }
}
type DiffAction = 'added' | 'removed' | 'same';

class DiffStatisticsCollector {
  public readonly changesByFile = new Map<string, DiffChanges>();
  public readonly total = new DiffChanges();

  public count(file: string, action: Exclude<DiffAction, 'same'>, amount = 1) {
    if (amount === 0) {
      // Nothing to see here
      return;
    }
    let changes = this.changesByFile.get(file);
    if (!changes) {
      changes = new DiffChanges();
      this.changesByFile.set(file, changes);
    }
    switch (action) {
      case 'added':
        changes.added += amount;
        this.total.added += amount;
        break;
      case 'removed':
        changes.removed += amount;
        this.total.removed += amount;
        break;
    }
  }

  public createDetailedReport(): string[] {
    return [...this.changesByFile.entries()].map(([fileName, changes]) => `${fileName} ${changes.toString()}`);
  }

  public createTotalsReport() {
    return `${chalk.yellowBright(this.changesByFile.size)} files changed (${this.total.toString()})`;
  }
}

/**
 * A greater-than-equals implementation for positions
 */
function gte(a: Position, b: Position) {
  return a.line > b.line || (a.line === b.line && a.column >= b.column);
}

function deepClone(loc: Location): Location {
  return { start: { ...loc.start }, end: { ...loc.end } };
}

/**
 * Reduces a mutant to a string that identifies the mutant across reports.
 * Consists of the relative file name, mutator name, replacement, and location
 */
function mutantToIdentifyingKey(
  { mutatorName, replacement, location: { start, end } }: Pick<Mutant, 'location' | 'mutatorName'> & { replacement?: string },
  relativeFileName: string
) {
  return `${relativeFileName}@${start.line}:${start.column}-${end.line}:${end.column}\n${mutatorName}: ${replacement}`;
}

function testToIdentifyingKey(
  { name, location, startPosition }: Pick<schema.TestDefinition, 'location' | 'name'> & Pick<TestResult, 'startPosition'>,
  relativeFileName: string | undefined
) {
  startPosition = startPosition ?? location?.start ?? { line: 0, column: 0 };
  return `${relativeFileName}@${startPosition.line}:${startPosition.column}\n${name}`;
}

function toRelativeNormalizedFileName(fileName: string | undefined) {
  return normalizeFileName(path.relative(process.cwd(), fileName ?? ''));
}

function calculateOffset(text: string): Position {
  const pos: Position = { line: 0, column: 0 };
  for (const char of text) {
    if (char === '\n') {
      pos.line++;
      pos.column = 0;
    } else {
      pos.column++;
    }
  }
  return pos;
}

function positionMove(pos: Position, diff: Position): Position {
  pos.line += diff.line;
  if (diff.line === 0) {
    pos.column += diff.column;
  } else {
    pos.column = diff.column;
  }
  return pos;
}

function locationAdd({ start, end }: Location, { line, column }: Position, currentLine: boolean) {
  start.line += line;
  if (currentLine) {
    start.column += column;
  }
  end.line += line;
  if (line === 0 && currentLine) {
    end.column += column;
  }
}

function negate({ line, column }: Position): Position {
  return { line: -1 * line, column: -1 * column };
}

/**
 * Determines if there is a diff between old test coverage and new test coverage.
 */
function diffTestCoverage(oldTestKeys: Set<string> | undefined, newTests: Set<TestResult> | undefined): Map<string, DiffAction> {
  const result = new Map<string, DiffAction>();
  if (newTests) {
    for (const newTest of newTests) {
      const key = testToIdentifyingKey(newTest, toRelativeNormalizedFileName(newTest.fileName));
      result.set(key, oldTestKeys?.has(key) ? 'same' : 'added');
    }
  }
  if (oldTestKeys) {
    for (const oldTestKey of oldTestKeys) {
      if (!result.has(oldTestKey)) {
        result.set(oldTestKey, 'removed');
      }
    }
  }
  return result;
}

function mutantCanBeReused(oldMutant: schema.MutantResult, testsDiff: Map<string, DiffAction>, oldKillingTests: Set<string> | undefined): boolean {
  if (oldMutant.status === MutantStatus.Killed) {
    if (oldKillingTests) {
      for (const killingTest of oldKillingTests) {
        if (testsDiff.get(killingTest) === 'same') {
          return true;
        }
      }
    }
    // Killing tests has changed or no longer exists
    return false;
  }
  for (const action of testsDiff.values()) {
    if (action === 'added') {
      // A non-killed mutant got a new test, we need to run it
      return false;
    }
  }
  // A non-killed mutant did not get new tests, no need to rerun it
  return true;
}

/**
 * Sets the end position of each test to the start position of the next test.
 * This is an educated guess and necessary.
 * If a test has no location, it is assumed it spans the entire file (line 0 to Infinity)
 *
 * Knowing the end location of tests is necessary in order to know if the test was changed.
 */
function closeLocations(testFile: schema.TestFile): LocatedTest[] {
  const locatedTests: LocatedTest[] = [];
  const openEndedTests: OpenEndedTest[] = [];

  testFile.tests.forEach((test) => {
    if (testHasLocation(test)) {
      if (isClosed(test)) {
        locatedTests.push(test);
      } else {
        openEndedTests.push(test);
      }
    } else {
      locatedTests.push({ ...test, location: { start: { line: 0, column: 0 }, end: { line: Number.POSITIVE_INFINITY, column: 0 } } });
    }
  });

  if (openEndedTests.length) {
    // Sort the opened tests in order to close their locations
    openEndedTests.sort((a, b) => a.location.start.line - b.location.start.line);

    const startPositions = uniqueStartPositions(openEndedTests);

    let currentPositionIndex = 0;
    let currentPosition = startPositions[currentPositionIndex];
    openEndedTests.forEach((test) => {
      if (currentPosition && test.location.start.line === currentPosition.line && test.location.start.column === currentPosition.column) {
        currentPositionIndex++;
        currentPosition = startPositions[currentPositionIndex];
      }
      if (currentPosition) {
        locatedTests.push({ ...test, location: { start: test.location.start, end: currentPosition } });
      }
    });

    // Don't forget about the last test
    const lastTest = openEndedTests[openEndedTests.length - 1];
    locatedTests.push({ ...lastTest, location: { start: lastTest.location.start, end: { line: Number.POSITIVE_INFINITY, column: 0 } } });
  }

  return locatedTests;
}

/**
 * Determines the unique start positions of a sorted list of tests in order
 */
function uniqueStartPositions(sortedTests: OpenEndedTest[]) {
  let current: Position | undefined;
  const startPositions = sortedTests.reduce<Position[]>((collector, { location: { start } }) => {
    if (!current || current.line !== start.line || current.column !== start.column) {
      current = start;
      collector.push(current);
    }
    return collector;
  }, []);
  return startPositions;
}

function testHasLocation(test: schema.TestDefinition): test is OpenEndedTest {
  return !!test.location?.start;
}

function isClosed(test: Required<schema.TestDefinition>): test is LocatedTest {
  return !!test.location.end;
}

type LocatedTest = schema.TestDefinition & { location: Location };
type OpenEndedTest = schema.TestDefinition & { location: schema.OpenEndLocation };
