import path from 'path';
import { promises as fsPromises } from 'fs';
import { isDeepStrictEqual } from 'util';

import { from, lastValueFrom } from 'rxjs';
import { filter, map, mergeMap, toArray } from 'rxjs/operators';
import { StrykerOptions, MutationRange, InputFiles, InputFile } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { File, isErrnoException, notEmpty } from '@stryker-mutator/util';
import minimatch, { type IMinimatch } from 'minimatch';

import { MAX_CONCURRENT_FILE_IO } from '../utils/file-utils.js';
import { defaultOptions, FileMatcher } from '../config/index.js';

import { InputFileCollector } from './input-file-collector.js';

const { Minimatch } = minimatch;

const ALWAYS_IGNORE = Object.freeze(['node_modules', '.git', '/reports', '*.tsbuildinfo', '/stryker.log']);

export const IGNORE_PATTERN_CHARACTER = '!';
/**
 * @see https://stryker-mutator.io/docs/stryker-js/configuration/#mutate-string
 * @example
 * * "src/app.js:1-11" will mutate lines 1 through 11 inside app.js.
 * * "src/app.js:5:4-6:4" will mutate from line 5, column 4 through line 6 column 4 inside app.js (columns 4 are included).
 * * "src/app.js:5-6:4" will mutate from line 5, column 0 through line 6 column 4 inside app.js (column 4 is included).
 */
export const MUTATION_RANGE_REGEX = /(.*?):((\d+)(?::(\d+))?-(\d+)(?::(\d+))?)$/;

export class InputFileResolver {
  private readonly mutatePatterns: readonly string[];
  private readonly ignoreRules: readonly string[];

  public static inject = tokens(commonTokens.logger, commonTokens.options);
  constructor(private readonly log: Logger, { mutate, tempDirName, ignorePatterns }: StrykerOptions) {
    this.mutatePatterns = mutate;
    this.ignoreRules = [...ALWAYS_IGNORE, tempDirName, ...ignorePatterns];
  }

  public async resolve(): Promise<InputFileCollector> {
    const inputFileNames = await this.resolveInputFileNames();
    const mutateInputFiles = this.resolveMutateInputFiles(inputFileNames);
    
    const files: File[] = await this.readFiles(inputFileNames);
    const inputFileCollection = new InputFileCollector(files, mutateFiles, mutationRange);
    inputFileCollection.logFiles(this.log, this.ignoreRules);
    return inputFileCollection;
  }

  private resolveMutateInputFiles(inputFileNames: string[]): InputFiles {
    // Only log about useless patterns when the user actually configured it
    const logAboutUselessPatterns = !isDeepStrictEqual(this.mutatePatterns, defaultOptions.mutate);

    const mutateInputFileMap = new Map<string, InputFile>();
    for (const pattern of this.mutatePatterns) {
      if (pattern.startsWith(IGNORE_PATTERN_CHARACTER)) {
        const files = this.filterMutatePattern(mutateInputFileMap.keys(), pattern.substring(1));
        if (logAboutUselessPatterns && files.size === 0) {
          this.log.warn(`Glob pattern "${pattern}" did not exclude any files.`);
        }
        for (const fileName of files.keys()) {
          mutateInputFileMap.delete(fileName);
        }
      } else {
        const files = this.filterMutatePattern(inputFileNames, pattern);
        if (logAboutUselessPatterns && files.size === 0) {
          this.log.warn(`Glob pattern "${pattern}" did not result in any files.`);
        }
        for (const [fileName, file] of files) {
          mutateInputFileMap.set(fileName, file);
        }
      }
    }
    return Object.fromEntries(mutateInputFileMap);
  }

  private filterMutatePattern(fileNames: Iterable<string>, pattern: string): Map<string, InputFile> {
    const match = MUTATION_RANGE_REGEX.exec(pattern);
    let mutate: InputFile['mutate'] = true;
    if (match) {
      const [_, newPattern, _mutationRange, startLine, startColumn = '0', endLine, endColumn = Number.MAX_SAFE_INTEGER.toString()] = match;
      pattern = newPattern;
      mutate = {
        start: { line: parseInt(startLine) - 1, column: parseInt(startColumn) },
        end: { line: parseInt(endLine) - 1, column: parseInt(endColumn) },
      };
    }
    const matcher = new FileMatcher(pattern);
    const inputFiles = new Map<string, InputFile>();
    for (const fileName in fileNames) {
      if (matcher.matches(fileName)) {
        inputFiles.set(fileName, { mutate });
      }
    }
    return inputFiles;
  }

  private resolveMutateFiles(inputFileNames: string[]) {
    return this.filterPatterns(inputFileNames, this.mutatePatterns, !isDeepStrictEqual(this.mutatePatterns, defaultOptions.mutate));
  }

  private resolveMutationRange(): MutationRange[] {
    return this.mutatePatterns
      .map((fileToMutate) => MUTATION_RANGE_REGEX.exec(fileToMutate))
      .filter(notEmpty)
      .map(([_, fileName, _mutationRange, startLine, startColumn = '0', endLine, endColumn = Number.MAX_SAFE_INTEGER.toString()]) => {
        return {
          fileName: path.resolve(fileName),
          start: { line: parseInt(startLine) - 1, column: parseInt(startColumn) },
          end: { line: parseInt(endLine) - 1, column: parseInt(endColumn) },
        };
      });
  }

  /**
   * Takes a list of globbing patterns and expands them into files.
   * If a patterns starts with a `!`, it negates the pattern.
   * @param fileNames the file names to filter
   * @param patterns The patterns to expand into files
   * @param logAboutUselessPatterns Weather or not to log about useless patterns
   */
  private filterPatterns(fileNames: readonly string[], patterns: readonly string[], logAboutUselessPatterns: boolean): string[] {
    const fileSet = new Set<string>();
    for (const pattern of patterns) {
      if (pattern.startsWith(IGNORE_PATTERN_CHARACTER)) {
        const files = this.filterPattern(fileSet, pattern.substr(1));
        if (logAboutUselessPatterns && files.length === 0) {
          this.log.warn(`Glob pattern "${pattern}" did not exclude any files.`);
        }
        files.forEach((fileName) => fileSet.delete(fileName));
      } else {
        const files = this.filterPattern(fileNames, pattern);
        if (logAboutUselessPatterns && files.length === 0) {
          this.log.warn(`Glob pattern "${pattern}" did not result in any files.`);
        }
        files.forEach((fileName) => fileSet.add(fileName));
      }
    }
    return Array.from(fileSet);
  }

  private filterPattern(fileNames: Iterable<string>, pattern: string): string[] {
    if (MUTATION_RANGE_REGEX.exec(pattern)) {
      pattern = pattern.replace(MUTATION_RANGE_REGEX, '$1');
    }
    const matcher = new FileMatcher(pattern);

    const filteredFileNames = [...fileNames].filter((fileName) => matcher.matches(fileName));
    return filteredFileNames;
  }

  private async resolveInputFileNames(): Promise<string[]> {
    const ignoreRules = this.ignoreRules.map((pattern) => new Minimatch(pattern, { dot: true, flipNegate: true, nocase: true }));

    /**
     * Rewrite of: https://github.com/npm/ignore-walk/blob/0e4f87adccb3e16f526d2e960ed04bdc77fd6cca/index.js#L213-L215
     */
    const matchesDirectoryPartially = (entryPath: string, rule: IMinimatch) => {
      // @ts-expect-error Missing overload in type definitions. See https://github.com/isaacs/minimatch/issues/134
      return rule.match(`/${entryPath}`, true) || rule.match(entryPath, true);
    };

    // Inspired by https://github.com/npm/ignore-walk/blob/0e4f87adccb3e16f526d2e960ed04bdc77fd6cca/index.js#L124
    const matchesDirectory = (entryName: string, entryPath: string, rule: IMinimatch) => {
      return (
        matchesFile(entryName, entryPath, rule) ||
        rule.match(`/${entryPath}/`) ||
        rule.match(`${entryPath}/`) ||
        (rule.negate && matchesDirectoryPartially(entryPath, rule))
      );
    };

    // Inspired by https://github.com/npm/ignore-walk/blob/0e4f87adccb3e16f526d2e960ed04bdc77fd6cca/index.js#L123
    const matchesFile = (entryName: string, entryPath: string, rule: IMinimatch) => {
      return rule.match(entryName) || rule.match(entryPath) || rule.match(`/${entryPath}`);
    };

    const crawlDir = async (dir: string, rootDir = dir): Promise<string[]> => {
      const dirEntries = await fsPromises.readdir(dir, { withFileTypes: true });
      const relativeName = path.relative(rootDir, dir);
      const files = await Promise.all(
        dirEntries
          .filter((dirEntry) => {
            let included = true;
            const entryPath = `${relativeName.length ? `${relativeName}/` : ''}${dirEntry.name}`;
            ignoreRules.forEach((rule) => {
              if (rule.negate !== included) {
                const match = dirEntry.isDirectory() ? matchesDirectory(dirEntry.name, entryPath, rule) : matchesFile(dirEntry.name, entryPath, rule);
                if (match) {
                  included = rule.negate;
                }
              }
            });
            return included;
          })
          .map(async (dirent) => {
            if (dirent.isDirectory()) {
              return crawlDir(path.resolve(rootDir, relativeName, dirent.name), rootDir);
            } else {
              return path.resolve(rootDir, relativeName, dirent.name);
            }
          })
      );
      return files.flat();
    };
    const files = await crawlDir(process.cwd());
    return files;
  }

  private async readFiles(fileNames: string[]): Promise<File[]> {
    const files$ = from(fileNames).pipe(
      mergeMap((fileName) => {
        return this.readFile(fileName);
      }, MAX_CONCURRENT_FILE_IO),
      filter(notEmpty),
      toArray(),
      // Filter the files here, so we force a deterministic instrumentation process
      map((files) => files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)))
    );
    return lastValueFrom(files$);
  }

  private async readFile(fileName: string): Promise<File | null> {
    try {
      const content = await fsPromises.readFile(fileName);
      const file = new File(fileName, content);
      return file;
    } catch (error) {
      if (isErrnoException(error) && (error.code === 'ENOENT' || error.code === 'EISDIR')) {
        return null; // file is deleted or a directory.
      } else {
        // Rethrow
        throw error;
      }
    }
  }
}
