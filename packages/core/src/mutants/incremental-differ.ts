import path from 'path';

import { diffChars, Change } from 'diff';
import { Mutant, MutantStatus, Position, schema } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { TestResult } from '@stryker-mutator/api/test-runner';
import { MutationTestResult, MutantResult, Location, TestDefinition, TestFileDefinitionDictionary } from 'mutation-testing-report-schema/api';
import { normalizeFileName, normalizeLineEndings, notEmpty } from '@stryker-mutator/util';

import { toPosixFileName } from '../config';

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
 * It uses the diff package to offset calculations for tests and mutants, see link.
 * @see https://npmjs.com/package/diff
 */
export class IncrementalDiffer {
  // We should introduce mutant key and test key as a record in the future
  // @see https://github.com/tc39/proposal-record-tuple
  private readonly reusableMutantsByKey: Map<string, MutantResult>;
  private readonly oldTestCoverageByMutantKey = new Map<string, Set<string>>();
  private readonly oldTestKilledByMutantKey = new Map<string, Set<string>>();
  private readonly collector = new DiffStatisticsCollector();

  constructor(incrementalReport: MutationTestResult, currentFiles: Map<string, string>, private readonly logger: Logger) {
    const { files, testFiles } = incrementalReport;

    this.reusableMutantsByKey = new Map(
      Object.entries(files).flatMap(([oldFileName, oldFile]) => {
        const currentFileSource = currentFiles.get(oldFileName);
        if (currentFileSource) {
          const changes = diffChars(normalizeLineEndings(oldFile.source), normalizeLineEndings(currentFileSource));
          return withUpdatedLocations(changes, oldFile.mutants).map((m) => [mutantToIdentifyingKey(m, oldFileName), m]);
        }
        // File is missing in the old project, cannot reuse these mutants
        return [];
      })
    );

    const testKeysByOldMutantId = new Map(
      Object.entries(testFiles ?? (Object.create(null) as TestFileDefinitionDictionary)).flatMap(([fileName, oldTestFile]) => {
        const currentFileSource = currentFiles.get(fileName);
        if (currentFileSource !== undefined && oldTestFile.source !== undefined) {
          const changes = diffChars(normalizeLineEndings(oldTestFile.source), normalizeLineEndings(currentFileSource));
          const locatedTests = closeLocations(oldTestFile);
          return withUpdatedLocations(changes, locatedTests).map((test) => [test.id, testToIdentifyingKey(test, fileName)]);
        }
        // No sources to compare, we should do our best with the info we do have
        return oldTestFile.tests.map((test) => [test.id, testToIdentifyingKey(test, fileName)]);
      })
    );
    for (const [key, mutant] of this.reusableMutantsByKey) {
      this.oldTestCoverageByMutantKey.set(key, new Set(mutant.coveredBy?.map((testId) => testKeysByOldMutantId.get(testId)).filter(notEmpty)));
      this.oldTestKilledByMutantKey.set(key, new Set(mutant.killedBy?.map((testId) => testKeysByOldMutantId.get(testId)).filter(notEmpty)));
    }
  }

  public diff(currentMutants: readonly Mutant[], currentTestsByMutantId: Map<string, Set<TestResult>>): readonly Mutant[] {
    return currentMutants.map((mutant) => {
      if (!mutant.status) {
        const key = mutantToIdentifyingKey(mutant, mutant.fileName);
        const oldMutant = this.reusableMutantsByKey.get(key);
        const coveringTests = currentTestsByMutantId.get(mutant.id);
        const testsDiff = diffTestCoverage(this.oldTestCoverageByMutantKey.get(key), coveringTests);
        const killedByTestKeys = this.oldTestKilledByMutantKey.get(key);
        if (oldMutant && mutantCanBeReused(oldMutant, testsDiff, killedByTestKeys)) {
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
                .filter((coveringTest) => killedByTestKeys.has(testToIdentifyingKey(coveringTest, coveringTest.fileName)))
                .map(({ id }) => id),
          };
        }
      }
      return mutant;
    });
  }
}

/**
 * Updates the locations of mutants or tests based on the diff result.
 * @param changes The text changes (result of the diff tool)
 * @param items The mutants or tests to update locations for. These will be treated as immutable.
 * @returns A list of items with updated locations, without items that are changed
 */
function withUpdatedLocations<T extends { location: Location }>(changes: Change[], items: T[]): T[] {
  const toDo = new Set(items.map((m) => ({ ...m, location: deepClone(m.location) })));
  const done: T[] = [];
  const currentPosition: Position = { column: 0, line: 0 };
  for (const change of changes) {
    if (toDo.size === 0) {
      // There are more changes, but nothing left to update.
      break;
    }
    const offset = calculateOffset(change.value);
    if (change.added) {
      toDo.forEach((test) => {
        const { location } = test;
        if (gte(currentPosition, location.start) && gte(location.end, currentPosition)) {
          // This item cannot be reused, code was added here
          toDo.delete(test);
        } else {
          locationAdd(location, offset, currentPosition.line === location.start.line);
        }
      });
      positionMove(currentPosition, offset);
    } else if (change.removed) {
      toDo.forEach((item) => {
        const {
          location: { start },
        } = item;
        const endOffset = positionMove({ ...currentPosition }, offset);
        if (gte(endOffset, start)) {
          // This item cannot be reused, the code it covers has changed
          toDo.delete(item);
        } else {
          locationAdd(item.location, negate(offset), currentPosition.line === start.line);
        }
      });
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
  // Add the tests with Number.MAX_SAFE_INTEGER as line number.
  done.push(...toDo);
  return done;
}

interface DiffChanges {
  added: number;
  removed: number;
  same: number;
}
class DiffStatisticsCollector {
  private readonly mutantChangesByFile = new Map<string, DiffChanges>();
  private readonly testChangesByFile = new Map<string, DiffChanges>();

  public countMutant(file: string, action: DiffAction) {
    this.count(this.mutantChangesByFile, file, action);
  }
  public countTest(file: string, action: DiffAction) {
    this.count(this.testChangesByFile, file, action);
  }

  private count(collector: Map<string, DiffChanges>, file: string, action: DiffAction) {
    let changes = collector.get(file);
    if (!changes) {
      changes = { added: 0, removed: 0, same: 0 };
      collector.set(file, changes);
    }
    switch (action) {
      case 'added':
        changes.added++;
        break;
      case 'removed':
        changes.removed++;
        break;
      case 'same':
        changes.same++;
        break;
    }
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
  fileName: string
) {
  return `${normalizeFileName(path.relative(process.cwd(), fileName))}@${start.line}:${start.column}-${end.line}:${
    end.column
  }\n${mutatorName}: ${replacement}`;
}

function testToIdentifyingKey(
  { name, location, startPosition }: Pick<TestDefinition, 'location' | 'name'> & Pick<TestResult, 'startPosition'>,
  fileName: string | undefined
) {
  startPosition = startPosition ?? location?.start ?? { line: 0, column: 0 };
  return `${normalizeFileName(path.relative(process.cwd(), fileName ?? ''))}@${startPosition.line}:${startPosition.column}\n${name}`;
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
      const key = testToIdentifyingKey(newTest, newTest.fileName);
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

type DiffAction = 'added' | 'removed' | 'same';
function mutantCanBeReused(oldMutant: MutantResult, testsDiff: Map<string, DiffAction>, oldKillingTests: Set<string> | undefined): boolean {
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
