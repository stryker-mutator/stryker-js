import path from 'path';

import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import chalk from 'chalk';
import {
  schema,
  Mutant,
  Position,
  Location,
  StrykerOptions,
  FileDescriptions,
  MutateDescription,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import {
  I,
  normalizeFileName,
  normalizeLineEndings,
  notEmpty,
} from '@stryker-mutator/util';
import { TestDefinition } from 'mutation-testing-report-schema';
import { commonTokens } from '@stryker-mutator/api/plugin';

import {
  DiffChange,
  DiffStatisticsCollector,
} from './diff-statistics-collector.js';
import { TestCoverage } from './test-coverage.js';

/**
 * The 'diff match patch' high-performant 'diffing' of files.
 * @see https://github.com/google/diff-match-patch
 */
const diffMatchPatch = new DiffMatchPatch();

/**
 * This class is responsible for calculating the diff between a run and a previous run based on the incremental report.
 *
 * Since the ids of tests and mutants can differ across reports (they are only unique within 1 report), this class
 * identifies mutants and tests by attributes that make them unique:
 * - Mutant: file name, mutator name, location and replacement
 * - Test: test name, test file name (if present) and location (if present).
 *
 * We're storing these identifiers in local variables (maps and sets) as strings.
 * We should move to 'records' for these when they come available: https://github.com/tc39/proposal-record-tuple
 *
 * A mutant result from the previous run is reused if the following conditions were met:
 * - The location of the mutant refers to a piece of code that didn't change
 * - If mutant was killed:
 *   - The culprit test wasn't changed
 * - If the mutant survived:
 *   - No test was added
 *
 * It uses google's "diff-match-patch" project to calculate the new locations for tests and mutants, see link.
 * @link https://github.com/google/diff-match-patch
 */
export class IncrementalDiffer {
  public mutantStatisticsCollector: DiffStatisticsCollector | undefined;
  public testStatisticsCollector: DiffStatisticsCollector | undefined;
  private readonly mutateDescriptionByRelativeFileName: Map<
    string,
    MutateDescription
  >;

  public static inject = [
    commonTokens.logger,
    commonTokens.options,
    commonTokens.fileDescriptions,
  ] as const;
  constructor(
    private readonly logger: Logger,
    private readonly options: StrykerOptions,
    fileDescriptions: FileDescriptions,
  ) {
    this.mutateDescriptionByRelativeFileName = new Map(
      Object.entries(fileDescriptions).map(([name, description]) => [
        toRelativeNormalizedFileName(name),
        description.mutate,
      ]),
    );
  }

  private isInMutatedScope(
    relativeFileName: string,
    mutant: schema.MutantResult,
  ): boolean {
    const mutate =
      this.mutateDescriptionByRelativeFileName.get(relativeFileName);
    return (
      mutate === true ||
      (Array.isArray(mutate) &&
        mutate.some((range) => locationIncluded(range, mutant.location)))
    );
  }

  public diff(
    currentMutants: readonly Mutant[],
    testCoverage: I<TestCoverage>,
    incrementalReport: schema.MutationTestResult,
    currentRelativeFiles: Map<string, string>,
  ): readonly Mutant[] {
    const { files, testFiles } = incrementalReport;
    const mutantStatisticsCollector = new DiffStatisticsCollector();
    const testStatisticsCollector = new DiffStatisticsCollector();

    // Expose the collectors for unit testing purposes
    this.mutantStatisticsCollector = mutantStatisticsCollector;
    this.testStatisticsCollector = testStatisticsCollector;

    // Collect what we can reuse, while correcting for diff in the locations
    const reusableMutantsByKey = collectReusableMutantsByKey(this.logger);
    const { byId: oldTestsById, byKey: oldTestInfoByKey } =
      collectReusableTestInfo(this.logger);

    // Collect some helper maps and sets
    const {
      oldCoverageByMutantKey: oldCoverageTestKeysByMutantKey,
      oldKilledByMutantKey: oldKilledTestKeysByMutantKey,
    } = collectOldKilledAndCoverageMatrix();
    const oldTestKeys = new Set(
      [...oldTestsById.values()].map(({ key }) => key),
    );
    const newTestKeys = new Set(
      [...testCoverage.testsById].map(([, test]) =>
        testToIdentifyingKey(test, toRelativeNormalizedFileName(test.fileName)),
      ),
    );

    // Create a dictionary to more easily get test information
    const testInfoByKey = collectCurrentTestInfo();

    // Mark which tests are added
    for (const [key, { relativeFileName }] of testInfoByKey) {
      if (!oldTestKeys.has(key)) {
        testStatisticsCollector.count(relativeFileName, 'added');
      }
    }

    // Make sure that tests that didn't run this time around aren't forgotten
    for (const [
      testKey,
      {
        test: { name, location },
        relativeFileName,
      },
    ] of oldTestInfoByKey) {
      if (!testInfoByKey.has(testKey)) {
        const test: TestResult = {
          status: TestStatus.Success,
          id: testKey,
          name,
          startPosition: location?.start,
          timeSpentMs: 0,
          fileName: path.resolve(relativeFileName),
        };
        testInfoByKey.set(testKey, {
          test,
          relativeFileName: relativeFileName,
        });
        testCoverage.addTest(test);
      }
    }

    // Done with preparations, time to map over the mutants
    let reusedMutantCount = 0;
    const currentMutantKeys = new Set<string>();
    const mutants = currentMutants.map((mutant) => {
      const relativeFileName = toRelativeNormalizedFileName(mutant.fileName);
      const mutantKey = mutantToIdentifyingKey(mutant, relativeFileName);
      currentMutantKeys.add(mutantKey);
      if (!mutant.status && !this.options.force) {
        const oldMutant = reusableMutantsByKey.get(mutantKey);
        if (oldMutant) {
          const coveringTests = testCoverage.forMutant(mutant.id);
          const killedByTestKeys = oldKilledTestKeysByMutantKey.get(mutantKey);
          if (
            mutantCanBeReused(
              mutant,
              oldMutant,
              mutantKey,
              coveringTests,
              killedByTestKeys,
            )
          ) {
            reusedMutantCount++;
            const { status, statusReason, testsCompleted } = oldMutant;
            return {
              ...mutant,
              status,
              statusReason,
              testsCompleted,
              coveredBy: [...(coveringTests ?? [])].map(({ id }) => id),
              killedBy: testKeysToId(killedByTestKeys),
            };
          }
        } else {
          mutantStatisticsCollector.count(relativeFileName, 'added');
        }
      }
      return mutant;
    });

    // Make sure that old mutants that didn't run this time around aren't forgotten

    for (const [mutantKey, oldResult] of reusableMutantsByKey) {
      // Do an additional check to see if the mutant is in mutated range.
      //
      // For example:
      // ```diff
      // - return a || b;
      // + return a && b;
      // ```
      // The conditional expression mutator here decides to _not_ mutate b to `false` the second time around. (even though the text of "b" itself didn't change)
      // Not doing this additional check would result in a sticky mutant that is never removed
      if (
        !currentMutantKeys.has(mutantKey) &&
        !this.isInMutatedScope(oldResult.relativeFileName, oldResult)
      ) {
        const coverage = oldCoverageTestKeysByMutantKey.get(mutantKey) ?? [];
        const killed = oldKilledTestKeysByMutantKey.get(mutantKey) ?? [];
        const coveredBy = testKeysToId(coverage);
        const killedBy = testKeysToId(killed);
        const reusedMutant = {
          ...oldResult,
          id: mutantKey,
          fileName: path.resolve(oldResult.relativeFileName),
          replacement: oldResult.replacement ?? oldResult.mutatorName,
          coveredBy,
          killedBy,
        };
        mutants.push(reusedMutant);
        testCoverage.addCoverage(reusedMutant.id, coveredBy);
      }
    }

    if (this.logger.isInfoEnabled()) {
      const testInfo = testCoverage.hasCoverage
        ? `\n\tTests:\t\t${testStatisticsCollector.createTotalsReport()}`
        : '';
      this.logger.info(
        `Incremental report:\n\tMutants:\t${mutantStatisticsCollector.createTotalsReport()}` +
          testInfo +
          `\n\tResult:\t\t${chalk.yellowBright(reusedMutantCount)} of ${currentMutants.length} mutant result(s) are reused.`,
      );
    }
    if (this.logger.isDebugEnabled()) {
      const lineSeparator = '\n\t\t';
      const noChanges = 'No changes';
      const detailedMutantSummary = `${lineSeparator}${mutantStatisticsCollector.createDetailedReport().join(lineSeparator) || noChanges}`;
      const detailedTestsSummary = `${lineSeparator}${testStatisticsCollector.createDetailedReport().join(lineSeparator) || noChanges}`;
      this.logger.debug(
        `Detailed incremental report:\n\tMutants: ${detailedMutantSummary}\n\tTests: ${detailedTestsSummary}`,
      );
    }
    return mutants;

    function testKeysToId(testKeys: Iterable<string> | undefined) {
      return [...(testKeys ?? [])]
        .map((id) => testInfoByKey.get(id))
        .filter(notEmpty)
        .map(({ test: { id } }) => id);
    }

    function collectReusableMutantsByKey(log: Logger) {
      return new Map(
        Object.entries(files).flatMap(([fileName, oldFile]) => {
          const relativeFileName = toRelativeNormalizedFileName(fileName);
          const currentFileSource = currentRelativeFiles.get(relativeFileName);
          if (currentFileSource) {
            log.trace('Diffing %s', relativeFileName);
            const { results, removeCount } = performFileDiff(
              oldFile.source,
              currentFileSource,
              oldFile.mutants,
            );
            mutantStatisticsCollector.count(
              relativeFileName,
              'removed',
              removeCount,
            );
            return results.map((m) => [
              mutantToIdentifyingKey(m, relativeFileName),
              {
                ...m,
                relativeFileName,
              },
            ]);
          }
          mutantStatisticsCollector.count(
            relativeFileName,
            'removed',
            oldFile.mutants.length,
          );
          // File has since been deleted, these mutants are not reused
          return [];
        }),
      );
    }

    function collectReusableTestInfo(log: Logger) {
      const byId = new Map<
        string,
        { relativeFileName: string; test: TestDefinition; key: string }
      >();
      const byKey = new Map<string, TestInfo>();

      Object.entries(testFiles ?? {}).forEach(([fileName, oldTestFile]) => {
        const relativeFileName = toRelativeNormalizedFileName(fileName);
        const currentFileSource = currentRelativeFiles.get(relativeFileName);
        if (currentFileSource === undefined && fileName !== '') {
          // An empty file name means the test runner cannot report test file locations.
          // If the current file is undefined while the test runner can report test file locations, it means it has been deleted
          log.debug('Test file removed: %s', relativeFileName);
          testStatisticsCollector.count(
            relativeFileName,
            'removed',
            oldTestFile.tests.length,
          );
        } else if (
          currentFileSource !== undefined &&
          oldTestFile.source !== undefined
        ) {
          log.trace('Diffing %s', relativeFileName);
          const locatedTests = closeLocations(oldTestFile);
          const { results, removeCount } = performFileDiff(
            oldTestFile.source,
            currentFileSource,
            locatedTests,
          );
          testStatisticsCollector.count(
            relativeFileName,
            'removed',
            removeCount,
          );
          results.forEach((test) => {
            const key = testToIdentifyingKey(test, relativeFileName);
            const testInfo = { key, test, relativeFileName };
            byId.set(test.id, testInfo);
            byKey.set(key, testInfo);
          });
        } else {
          // No sources to compare, we should do our best with the info we do have
          oldTestFile.tests.map((test) => {
            const key = testToIdentifyingKey(test, relativeFileName);
            const testInfo = { key, test, relativeFileName };
            byId.set(test.id, testInfo);
            byKey.set(key, testInfo);
          });
        }
      });
      return { byId, byKey };
    }

    function collectOldKilledAndCoverageMatrix() {
      const oldCoverageByMutantKey = new Map<string, Set<string>>();
      const oldKilledByMutantKey = new Map<string, Set<string>>();

      for (const [key, mutant] of reusableMutantsByKey) {
        const killedRow = new Set(
          mutant.killedBy
            ?.map((testId) => oldTestsById.get(testId)?.key)
            .filter(notEmpty),
        );
        const coverageRow = new Set(
          mutant.coveredBy
            ?.map((testId) => oldTestsById.get(testId)?.key)
            .filter(notEmpty),
        );
        killedRow.forEach((killed) => coverageRow.add(killed));
        oldCoverageByMutantKey.set(key, coverageRow);
        oldKilledByMutantKey.set(key, killedRow);
      }
      return { oldCoverageByMutantKey, oldKilledByMutantKey };
    }

    function collectCurrentTestInfo() {
      const byTestKey = new Map<
        string,
        { relativeFileName: string; test: TestResult }
      >();
      for (const testResult of testCoverage.testsById.values()) {
        const relativeFileName = toRelativeNormalizedFileName(
          testResult.fileName,
        );
        const key = testToIdentifyingKey(testResult, relativeFileName);
        const info = { relativeFileName, test: testResult, key: key };
        byTestKey.set(key, info);
      }

      return byTestKey;
    }

    function mutantCanBeReused(
      mutant: Mutant,
      oldMutant: schema.MutantResult,
      mutantKey: string,
      coveringTests: ReadonlySet<TestResult> | undefined,
      oldKillingTests: Set<string> | undefined,
    ): boolean {
      if (!testCoverage.hasCoverage) {
        // This is the best we can do when the test runner didn't report coverage.
        // We assume that all mutant test results can be reused,
        // End users can use --force to force retesting of certain mutants
        return true;
      }
      if (oldMutant.status === 'Ignored') {
        // Was previously ignored, but not anymore, we need to run it now
        return false;
      }

      const testsDiff = diffTestCoverage(
        mutant.id,
        oldCoverageTestKeysByMutantKey.get(mutantKey),
        coveringTests,
      );
      if (oldMutant.status === 'Killed') {
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
     * Determines if there is a diff between old test coverage and new test coverage.
     */
    function diffTestCoverage(
      mutantId: string,
      oldCoveringTestKeys: Set<string> | undefined,
      newCoveringTests: ReadonlySet<TestResult> | undefined,
    ): Map<string, DiffAction> {
      const result = new Map<string, DiffAction>();
      if (newCoveringTests) {
        for (const newTest of newCoveringTests) {
          const key = testToIdentifyingKey(
            newTest,
            toRelativeNormalizedFileName(newTest.fileName),
          );
          result.set(key, oldCoveringTestKeys?.has(key) ? 'same' : 'added');
        }
      }
      if (oldCoveringTestKeys) {
        const isStatic = testCoverage.hasStaticCoverage(mutantId);
        for (const oldTestKey of oldCoveringTestKeys) {
          if (!result.has(oldTestKey)) {
            // Static mutants might not have covering tests, but the test might still exist
            if (isStatic && newTestKeys.has(oldTestKey)) {
              result.set(oldTestKey, 'same');
            } else {
              result.set(oldTestKey, 'removed');
            }
          }
        }
      }
      return result;
    }
  }
}

/**
 * Finds the diff of mutants and tests. Removes mutants / tests that no longer exist (changed or removed). Updates locations of mutants or tests that do still exist.
 * @param oldCode The old code to use for the diff
 * @param newCode The new (current) code to use for the diff
 * @param items The mutants or tests to be looked . These will be treated as immutable.
 * @returns A list of items with updated locations, without items that are changed.
 */
function performFileDiff<T extends { location: Location }>(
  oldCode: string,
  newCode: string,
  items: T[],
): { results: T[]; removeCount: number } {
  const oldSourceNormalized = normalizeLineEndings(oldCode);
  const currentSrcNormalized = normalizeLineEndings(newCode);
  const diffChanges = diffMatchPatch.diff_main(
    oldSourceNormalized,
    currentSrcNormalized,
  );

  const toDo = new Set(
    items.map((m) => ({ ...m, location: deepClone(m.location) })),
  );
  const [added, removed] = [1, -1];
  const done: T[] = [];
  const currentPosition: Position = { column: 0, line: 0 };
  let removeCount = 0;
  for (const [change, text] of diffChanges) {
    if (toDo.size === 0) {
      // There are more changes, but nothing left to update.
      break;
    }
    const offset = calculateOffset(text);
    if (change === added) {
      for (const test of toDo) {
        const { location } = test;
        if (
          gte(currentPosition, location.start) &&
          gte(location.end, currentPosition)
        ) {
          // This item cannot be reused, code was added here
          removeCount++;
          toDo.delete(test);
        } else {
          locationAdd(
            location,
            offset,
            currentPosition.line === location.start.line,
          );
        }
      }
      positionMove(currentPosition, offset);
    } else if (change === removed) {
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
          locationAdd(
            item.location,
            negate(offset),
            currentPosition.line === start.line,
          );
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

/**
 * A greater-than-equals implementation for positions
 */
function gte(a: Position, b: Position) {
  return a.line > b.line || (a.line === b.line && a.column >= b.column);
}

function locationIncluded(haystack: Location, needle: Location) {
  const startIncluded = gte(needle.start, haystack.start);
  const endIncluded = gte(haystack.end, needle.end);
  return startIncluded && endIncluded;
}

function deepClone(loc: Location): Location {
  return { start: { ...loc.start }, end: { ...loc.end } };
}

/**
 * Reduces a mutant to a string that identifies the mutant across reports.
 * Consists of the relative file name, mutator name, replacement, and location
 */
function mutantToIdentifyingKey(
  {
    mutatorName,
    replacement,
    location: { start, end },
  }: Pick<Mutant, 'location' | 'mutatorName'> & { replacement?: string },
  relativeFileName: string,
) {
  return `${relativeFileName}@${start.line}:${start.column}-${end.line}:${end.column}\n${mutatorName}: ${replacement}`;
}

function testToIdentifyingKey(
  {
    name,
    location,
    startPosition,
  }: Pick<schema.TestDefinition, 'location' | 'name'> &
    Pick<TestResult, 'startPosition'>,
  relativeFileName: string | undefined,
) {
  startPosition = startPosition ?? location?.start ?? { line: 0, column: 0 };
  return `${relativeFileName}@${startPosition.line}:${startPosition.column}\n${name}`;
}

export function toRelativeNormalizedFileName(
  fileName: string | undefined,
): string {
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

function locationAdd(
  { start, end }: Location,
  { line, column }: Position,
  currentLine: boolean,
) {
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

interface TestInfo {
  relativeFileName: string;
  test: TestDefinition;
  key: string;
}

type DiffAction = DiffChange | 'same';

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
      locatedTests.push({
        ...test,
        location: {
          start: { line: 0, column: 0 },
          end: { line: Number.POSITIVE_INFINITY, column: 0 },
        },
      });
    }
  });

  if (openEndedTests.length) {
    // Sort the opened tests in order to close their locations
    openEndedTests.sort(
      (a, b) => a.location.start.line - b.location.start.line,
    );
    const openEndedTestSet = new Set(openEndedTests);
    const startPositions = uniqueStartPositions(openEndedTests);

    let currentPositionIndex = 0;
    openEndedTestSet.forEach((test) => {
      if (
        eqPosition(test.location.start, startPositions[currentPositionIndex])
      ) {
        currentPositionIndex++;
      }
      if (startPositions[currentPositionIndex]) {
        locatedTests.push({
          ...test,
          location: {
            start: test.location.start,
            end: startPositions[currentPositionIndex],
          },
        });
        openEndedTestSet.delete(test);
      }
    });

    // Don't forget about the last tests
    openEndedTestSet.forEach((lastTest) => {
      locatedTests.push({
        ...lastTest,
        location: {
          start: lastTest.location.start,
          end: { line: Number.POSITIVE_INFINITY, column: 0 },
        },
      });
    });
  }

  return locatedTests;
}

/**
 * Determines the unique start positions of a sorted list of tests in order
 */
function uniqueStartPositions(sortedTests: OpenEndedTest[]) {
  let current: Position | undefined;
  const startPositions = sortedTests.reduce<Position[]>(
    (collector, { location: { start } }) => {
      if (
        !current ||
        current.line !== start.line ||
        current.column !== start.column
      ) {
        current = start;
        collector.push(current);
      }
      return collector;
    },
    [],
  );
  return startPositions;
}

function testHasLocation(test: schema.TestDefinition): test is OpenEndedTest {
  return !!test.location?.start;
}

function isClosed(test: Required<schema.TestDefinition>): test is LocatedTest {
  return !!test.location.end;
}

function eqPosition(start: Position, end?: Position): boolean {
  return start.column === end?.column && start.line === end.line;
}

type LocatedTest = schema.TestDefinition & { location: Location };
type OpenEndedTest = schema.TestDefinition & {
  location: schema.OpenEndLocation;
};
