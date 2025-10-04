import path from 'path';
import { isDeepStrictEqual } from 'util';

import { Minimatch } from 'minimatch';
import {
  StrykerOptions,
  FileDescriptions,
  FileDescription,
  Location,
  Position,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import {
  ERROR_CODES,
  I,
  isErrnoException,
  notEmpty,
} from '@stryker-mutator/util';
import type { MutationTestResult } from 'mutation-testing-report-schema/api';

import { OpenEndLocation } from 'mutation-testing-report-schema';

import { defaultOptions, FileMatcher } from '../config/index.js';
import { coreTokens } from '../di/index.js';

import { Project } from './project.js';
import { FileSystem } from './file-system.js';

const ALWAYS_IGNORE = Object.freeze([
  'node_modules',
  '.git',
  '*.tsbuildinfo',
  '/stryker.log',
  '.next',
  '.nuxt',
  '.svelte-kit',
]);

export const IGNORE_PATTERN_CHARACTER = '!';
/**
 * @see https://stryker-mutator.io/docs/stryker-js/configuration/#mutate-string
 * @example
 * * "src/app.js:1-11" will mutate lines 1 through 11 inside app.js.
 * * "src/app.js:5:4-6:4" will mutate from line 5, column 4 through line 6 column 4 inside app.js (columns 4 are included).
 * * "src/app.js:5-6:4" will mutate from line 5, column 0 through line 6 column 4 inside app.js (column 4 is included).
 */
export const MUTATION_RANGE_REGEX =
  /(.*?):((\d+)(?::(\d+))?-(\d+)(?::(\d+))?)$/;

export class ProjectReader {
  private readonly mutatePatterns: readonly string[];
  private readonly ignoreRules: readonly string[];
  private readonly incremental: boolean;
  private readonly force: boolean;
  private readonly incrementalFile: string;

  public static inject = tokens(
    coreTokens.fs,
    commonTokens.logger,
    commonTokens.options,
  );
  constructor(
    private readonly fs: I<FileSystem>,
    private readonly log: Logger,
    {
      mutate,
      tempDirName,
      ignorePatterns,
      incremental,
      incrementalFile,
      force,
      htmlReporter,
      jsonReporter,
    }: StrykerOptions,
  ) {
    this.mutatePatterns = mutate;
    this.ignoreRules = [
      ...ALWAYS_IGNORE,
      tempDirName,
      incrementalFile,
      htmlReporter.fileName,
      jsonReporter.fileName,
      ...ignorePatterns,
    ];
    this.incremental = incremental;
    this.incrementalFile = incrementalFile;
    this.force = force;
  }

  public async read(
    targetMutatePatterns: string[] | undefined,
  ): Promise<Project> {
    const inputFileNames = await this.resolveInputFileNames();
    const fileDescriptions = this.resolveFileDescriptions(
      inputFileNames,
      targetMutatePatterns,
    );
    const project = new Project(
      this.fs,
      fileDescriptions,
      await this.readIncrementalReport(),
    );
    project.logFiles(
      this.log,
      this.ignoreRules,
      this.force,
      this.mutatePatterns,
    );
    return project;
  }

  /**
   * Takes the list of file names and creates file description object from it, containing logic about wether or not it needs to be mutated.
   * If a mutate pattern starts with a `!`, it negates the pattern.
   * @param inputFileNames the file names to filter
   * @param targetMutatePatterns optional mutate patterns to limit the initial scope of files to mutate (with ranges)
   */
  private resolveFileDescriptions(
    inputFileNames: string[],
    targetMutatePatterns: string[] | undefined,
  ): FileDescriptions {
    // Only log about useless patterns when the user actually configured it
    const logAboutUselessPatterns = !isDeepStrictEqual(
      this.mutatePatterns,
      defaultOptions.mutate,
    );

    // Start out without files to mutate
    const mutateInputFileMap = new Map<string, FileDescription>();
    inputFileNames.forEach((fileName) =>
      mutateInputFileMap.set(fileName, { mutate: false }),
    );

    // Now lets see what we need to mutate
    for (const pattern of this.mutatePatterns) {
      if (pattern.startsWith(IGNORE_PATTERN_CHARACTER)) {
        const files = this.filterMutatePattern(
          mutateInputFileMap.keys(),
          pattern.substring(1),
        );
        if (logAboutUselessPatterns && files.size === 0) {
          this.log.warn(`Glob pattern "${pattern}" did not exclude any files.`);
        }
        for (const fileName of files.keys()) {
          mutateInputFileMap.set(fileName, { mutate: false });
        }
      } else {
        const files = this.filterMutatePattern(inputFileNames, pattern);
        if (logAboutUselessPatterns && files.size === 0) {
          this.log.warn(
            `Glob pattern "${pattern}" did not result in any files.`,
          );
        }
        for (const [fileName, file] of files) {
          mutateInputFileMap.set(
            fileName,
            this.unionFileDescriptions(file, mutateInputFileMap.get(fileName)),
          );
        }
      }
    }

    if (targetMutatePatterns) {
      // Now filter on the target patterns, but only when specified
      // First, collect all files that should be mutated in 'seen'
      const seen = new Map<string, FileDescription>();
      for (const pattern of targetMutatePatterns) {
        const files = this.filterMutatePattern(
          mutateInputFileMap.keys(),
          pattern,
        );
        for (const [fileName, description] of files) {
          const intersected = this.intersectFileDescriptions(
            mutateInputFileMap.get(fileName)!,
            description,
          );
          seen.set(
            fileName,
            this.unionFileDescriptions(intersected, seen.get(fileName)),
          );
        }
      }
      // Now, reset the mutateInputFileMap to false for all files that we didn't see, but only mark files to be mutated when they appeared in the configured target patterns
      // We do this so we return all the input files, with its status on whether or not to mutate it
      for (const fileName of mutateInputFileMap.keys()) {
        const descriptionInSeen = seen.get(fileName);
        if (descriptionInSeen) {
          mutateInputFileMap.set(fileName, descriptionInSeen);
        } else {
          mutateInputFileMap.set(fileName, { mutate: false });
        }
      }
    }
    return Object.fromEntries(mutateInputFileMap);
  }

  private unionFileDescriptions(
    first: FileDescription,
    second?: FileDescription,
  ): FileDescription {
    if (second) {
      if (Array.isArray(first.mutate) && Array.isArray(second.mutate)) {
        return { mutate: [...second.mutate, ...first.mutate] };
      } else if (second.mutate === true) {
        return { mutate: true };
      }

      return { mutate: first.mutate || second.mutate };
    }
    return first;
  }

  private intersectFileDescriptions(
    first: FileDescription,
    second: FileDescription,
  ): FileDescription {
    if (Array.isArray(first.mutate) && Array.isArray(second.mutate)) {
      // Both have mutation ranges, intersect them
      const secondMutate = second.mutate;
      const intersectedRanges = first.mutate
        .flatMap((firstRange) =>
          secondMutate.map((secondRange) => {
            const startLine = Math.max(
              firstRange.start.line,
              secondRange.start.line,
            );
            const endLine = Math.min(firstRange.end.line, secondRange.end.line);
            if (startLine > endLine) {
              return;
            }
            const startColumn =
              firstRange.start.line === startLine
                ? firstRange.start.column
                : secondRange.start.column;
            const endColumn =
              firstRange.end.line === endLine
                ? firstRange.end.column
                : secondRange.end.column;
            return {
              start: { line: startLine, column: startColumn },
              end: { line: endLine, column: endColumn },
            };
          }),
        )
        .filter(notEmpty);
      return { mutate: intersectedRanges };
    } else if (first.mutate === true) {
      return second;
    } else if (second.mutate === true) {
      return first;
    }

    // Both have mutation ranges, but one of them is empty, so the intersection is empty
    return { mutate: false };
  }

  /**
   * Filters a given list of file names given a mutate pattern.
   * @param fileNames the file names to match to the pattern
   * @param mutatePattern the pattern to match with
   */
  private filterMutatePattern(
    fileNames: Iterable<string>,
    mutatePattern: string,
  ): Map<string, FileDescription> {
    const mutationRangeMatch = MUTATION_RANGE_REGEX.exec(mutatePattern);
    let mutate: FileDescription['mutate'] = true;
    if (mutationRangeMatch) {
      const [
        _,
        newPattern,
        _mutationRange,
        startLine,
        startColumn = '0',
        endLine,
        endColumn = Number.MAX_SAFE_INTEGER.toString(),
      ] = mutationRangeMatch;
      mutatePattern = newPattern;
      mutate = [
        {
          start: {
            line: parseInt(startLine) - 1,
            column: parseInt(startColumn),
          },
          end: { line: parseInt(endLine) - 1, column: parseInt(endColumn) },
        },
      ];
    }
    const matcher = new FileMatcher(
      mutatePattern,
      /* allowHiddenFiles */ false,
    );
    const inputFiles = new Map<string, FileDescription>();
    for (const fileName of fileNames) {
      if (matcher.matches(fileName)) {
        inputFiles.set(fileName, { mutate });
      }
    }
    return inputFiles;
  }

  private async resolveInputFileNames(): Promise<string[]> {
    const ignoreRules = this.ignoreRules.map(
      (pattern) =>
        new Minimatch(pattern, { dot: true, flipNegate: true, nocase: true }),
    );

    /**
     * Rewrite of: https://github.com/npm/ignore-walk/blob/0e4f87adccb3e16f526d2e960ed04bdc77fd6cca/index.js#L213-L215
     */
    const matchesDirectoryPartially = (entryPath: string, rule: Minimatch) => {
      return rule.match(`/${entryPath}`, true) || rule.match(entryPath, true);
    };

    // Inspired by https://github.com/npm/ignore-walk/blob/0e4f87adccb3e16f526d2e960ed04bdc77fd6cca/index.js#L124
    const matchesDirectory = (
      entryName: string,
      entryPath: string,
      rule: Minimatch,
    ) => {
      return (
        matchesFile(entryName, entryPath, rule) ||
        rule.match(`/${entryPath}/`) ||
        rule.match(`${entryPath}/`) ||
        (rule.negate && matchesDirectoryPartially(entryPath, rule))
      );
    };

    // Inspired by https://github.com/npm/ignore-walk/blob/0e4f87adccb3e16f526d2e960ed04bdc77fd6cca/index.js#L123
    const matchesFile = (
      entryName: string,
      entryPath: string,
      rule: Minimatch,
    ) => {
      return (
        rule.match(entryName) ||
        rule.match(entryPath) ||
        rule.match(`/${entryPath}`)
      );
    };

    const crawlDir = async (dir: string, rootDir = dir): Promise<string[]> => {
      const dirEntries = await this.fs.readdir(dir, { withFileTypes: true });
      const relativeName = path.relative(rootDir, dir);
      const files = await Promise.all(
        dirEntries
          .filter((dirEntry) => {
            let included = true;
            const entryPath = `${relativeName.length ? `${relativeName}/` : ''}${dirEntry.name}`;
            ignoreRules.forEach((rule) => {
              if (rule.negate !== included) {
                const match = dirEntry.isDirectory()
                  ? matchesDirectory(dirEntry.name, entryPath, rule)
                  : matchesFile(dirEntry.name, entryPath, rule);
                if (match) {
                  included = rule.negate;
                }
              }
            });
            return included;
          })
          .map(async (dirent) => {
            if (dirent.isDirectory()) {
              return crawlDir(
                path.resolve(rootDir, relativeName, dirent.name),
                rootDir,
              );
            } else {
              return path.resolve(rootDir, relativeName, dirent.name);
            }
          }),
      );
      return files.flat();
    };
    const files = await crawlDir(process.cwd());
    return files;
  }

  private async readIncrementalReport(): Promise<
    MutationTestResult | undefined
  > {
    if (!this.incremental) {
      return;
    }
    try {
      // TODO: Validate against the schema or stryker version?
      const contents = await this.fs.readFile(this.incrementalFile, 'utf-8');
      const result: MutationTestResult = JSON.parse(contents);
      return {
        ...result,
        files: Object.fromEntries(
          Object.entries(result.files).map(([fileName, file]) => [
            fileName,
            {
              ...file,
              mutants: file.mutants.map((mutant) => ({
                ...mutant,
                location: reportLocationToStrykerLocation(mutant.location),
              })),
            },
          ]),
        ),
        testFiles:
          result.testFiles &&
          Object.fromEntries(
            Object.entries(result.testFiles).map(([fileName, file]) => [
              fileName,
              {
                ...file,
                tests: file.tests.map((test) => ({
                  ...test,
                  location:
                    test.location &&
                    reportOpenEndLocationToStrykerLocation(test.location),
                })),
              },
            ]),
          ),
      };
    } catch (err: unknown) {
      if (
        isErrnoException(err) &&
        err.code === ERROR_CODES.NoSuchFileOrDirectory
      ) {
        this.log.info(
          'No incremental result file found at %s, a full mutation testing run will be performed.',
          this.incrementalFile,
        );
        return;
      }
      // Whoops, didn't mean to catch this one!
      throw err;
    }
  }
}

function reportOpenEndLocationToStrykerLocation({
  start,
  end,
}: OpenEndLocation): OpenEndLocation {
  return {
    start: reportPositionToStrykerPosition(start),
    end: end && reportPositionToStrykerPosition(end),
  };
}

function reportLocationToStrykerLocation({ start, end }: Location): Location {
  return {
    start: reportPositionToStrykerPosition(start),
    end: reportPositionToStrykerPosition(end),
  };
}

function reportPositionToStrykerPosition({ line, column }: Position): Position {
  // stryker's positions are 0-based
  return {
    line: line - 1,
    column: column - 1,
  };
}
