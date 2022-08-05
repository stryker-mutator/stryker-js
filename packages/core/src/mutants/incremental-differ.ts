import path from 'path';

import { diffChars, Change } from 'diff';
import { Mutant, Position } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { MutationTestResult, MutantResult, Location } from 'mutation-testing-report-schema/api';

export class IncrementalDiffer {
  private readonly reusableMutantsByKey: Map<string, MutantResult>;

  constructor(incrementalReport: MutationTestResult, currentFiles: Map<string, string>, private readonly logger: Logger) {
    const { files } = incrementalReport;

    this.reusableMutantsByKey = new Map(
      Object.entries(files).flatMap(([oldFileName, oldFile]) => {
        const currentFileSource = currentFiles.get(oldFileName);
        if (currentFileSource) {
          const changes = diffChars(oldFile.source, currentFileSource);
          return processDiffChanges(changes, oldFile.mutants).map((m) => [toIdentifyingKey(m, oldFileName), m]);
        }
        // File is missing in the old project, cannot reuse these mutants
        return [];
      })
    );
  }

  public diff(currentMutants: readonly Mutant[]): readonly Mutant[] {
    return currentMutants.map((mutant) => {
      const key = toIdentifyingKey(mutant, mutant.fileName);
      const oldMutant = this.reusableMutantsByKey.get(key);
      if (oldMutant) {
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
 * @param changes The changes to process
 * @param mutants The mutants to update locations for. These will NOT be mutated
 * @returns A list of mutants with updated locations
 */
function processDiffChanges(changes: Change[], mutants: MutantResult[]) {
  const mutantsToEvaluate = new Set(mutants.map((m) => ({ ...m, location: deepClone(m.location) })));
  const mutantsToReuse: MutantResult[] = [];
  const offset: Position = { column: 0, line: 0 };
  for (const change of changes) {
    const valueOffset = calculateOffset(change.value);
    if (change.added) {
      mutantsToEvaluate.forEach(({ location }) => updateLocation(location, valueOffset, offset.line === location.start.line));
      progressOffset(offset, valueOffset);
    } else if (change.removed) {
      mutantsToEvaluate.forEach((mutant) => {
        const {
          location: { start },
        } = mutant;
        const endOffset = progressOffset({ ...offset }, valueOffset);
        if (gte(endOffset, start)) {
          // This mutant cannot be reused, the code it covers has changed
          mutantsToEvaluate.delete(mutant);
        } else {
          updateLocation(mutant.location, negate(valueOffset), offset.line === start.line);
        }
      });
    } else {
      progressOffset(offset, valueOffset);
      mutantsToEvaluate.forEach((mutant) => {
        const { end } = mutant.location;
        if (gte(offset, end)) {
          // We're done with this mutant, it can be reused
          mutantsToEvaluate.delete(mutant);
          mutantsToReuse.push(mutant);
        }
      });
    }
  }
  return mutantsToReuse;
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
function toIdentifyingKey(
  { mutatorName, replacement, location: { start, end } }: Pick<Mutant, 'location' | 'mutatorName'> & { replacement?: string },
  fileName: string
) {
  return `${path.relative(process.cwd(), fileName)}@${start.line}:${start.column}-${end.line}:${end.column}\n${mutatorName}: ${replacement}`;
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
