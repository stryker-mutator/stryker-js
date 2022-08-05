import path from 'path';

import { diffChars, Change } from 'diff';
import { Mutant, MutantStatus, Position } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { TestResult } from '@stryker-mutator/api/test-runner';
import { MutationTestResult, MutantResult, Location, TestDefinition, TestFileDefinitionDictionary } from 'mutation-testing-report-schema/api';
import { notEmpty } from '@stryker-mutator/util';

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

  constructor(incrementalReport: MutationTestResult, currentFiles: Map<string, string>, private readonly logger: Logger) {
    const { files, testFiles } = incrementalReport;

    this.reusableMutantsByKey = new Map(
      Object.entries(files).flatMap(([oldFileName, oldFile]) => {
        const currentFileSource = currentFiles.get(oldFileName);
        if (currentFileSource) {
          const changes = diffChars(oldFile.source, currentFileSource);
          return withUpdatedLocations(changes, oldFile.mutants).map((m) => [mutantToIdentifyingKey(m, oldFileName), m]);
        }
        // File is missing in the old project, cannot reuse these mutants
        return [];
      })
    );

    const testKeysById = new Map(
      Object.entries(testFiles ?? (Object.create(null) as TestFileDefinitionDictionary)).flatMap(([fileName, testFile]) =>
        testFile.tests.map((test) => [test.id, testToIdentifyingKey(test, fileName)])
      )
    );
    for (const [key, mutant] of this.reusableMutantsByKey) {
      this.oldTestCoverageByMutantKey.set(key, new Set(mutant.coveredBy?.map((testId) => testKeysById.get(testId)).filter(notEmpty)));
      this.oldTestKilledByMutantKey.set(key, new Set(mutant.killedBy?.map((testId) => testKeysById.get(testId)).filter(notEmpty)));
    }
  }

  public diff(currentMutants: readonly Mutant[], currentTestsByMutantId: Map<string, Set<TestResult>>): readonly Mutant[] {
    return currentMutants.map((mutant) => {
      const key = mutantToIdentifyingKey(mutant, mutant.fileName);
      const oldMutant = this.reusableMutantsByKey.get(key);
      const testsDiff = diffTestCoverage(this.oldTestCoverageByMutantKey.get(key), currentTestsByMutantId.get(mutant.id));
      if (oldMutant && mutantCanBeReused(oldMutant, testsDiff, this.oldTestKilledByMutantKey.get(key))) {
        const { status, statusReason, coveredBy, testsCompleted, killedBy } = oldMutant;
        return {
          ...mutant,
          status,
          statusReason,
          coveredBy,
          testsCompleted,
          killedBy,
        };
      }
      return mutant;
    });
  }
}

/**
 * Updates the locations of mutants based on the diff result.
 * @param changes The changes (result of the diff tool)
 * @param mutants The mutants to update locations for. These will be treated as immutable.
 * @returns A list of mutants with updated locations
 */
function withUpdatedLocations(changes: Change[], mutants: MutantResult[]): MutantResult[] {
  const toDo = new Set(mutants.map((m) => ({ ...m, location: deepClone(m.location) })));
  const done: MutantResult[] = [];
  const offset: Position = { column: 0, line: 0 };
  for (const change of changes) {
    const valueOffset = calculateOffset(change.value);
    if (change.added) {
      toDo.forEach(({ location }) => updateLocation(location, valueOffset, offset.line === location.start.line));
      progressOffset(offset, valueOffset);
    } else if (change.removed) {
      toDo.forEach((mutant) => {
        const {
          location: { start },
        } = mutant;
        const endOffset = progressOffset({ ...offset }, valueOffset);
        if (gte(endOffset, start)) {
          // This mutant cannot be reused, the code it covers has changed
          toDo.delete(mutant);
        } else {
          updateLocation(mutant.location, negate(valueOffset), offset.line === start.line);
        }
      });
    } else {
      progressOffset(offset, valueOffset);
      toDo.forEach((mutant) => {
        const { end } = mutant.location;
        if (gte(offset, end)) {
          // We're done with this mutant, it can be reused
          toDo.delete(mutant);
          done.push(mutant);
        }
      });
    }
  }
  return done;
}

function progressOffset(offset: Position, addedOffset: Position): Position {
  offset.line += addedOffset.line;
  if (addedOffset.line === 0) {
    offset.column += addedOffset.column;
  } else {
    offset.column = addedOffset.column;
  }
  return offset;
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
  return `${path.relative(process.cwd(), fileName)}@${start.line}:${start.column}-${end.line}:${end.column}\n${mutatorName}: ${replacement}`;
}

function testToIdentifyingKey({ name, location }: Pick<TestDefinition, 'location' | 'name'>, fileName = '') {
  const locationDescription = location
    ? `@${location.start.line}:${location.start.column}${location.end ? `-${location.end.line}:${location.end.column}` : ''}`
    : '';
  return `${path.relative(process.cwd(), fileName)}${locationDescription}\n${name}`;
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

function updateLocation({ start, end }: Location, { line, column }: Position, currentLine: boolean) {
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
