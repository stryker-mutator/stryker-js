import path from 'path';
import { promises as fsPromises } from 'fs';

import { isDeepStrictEqual } from 'util';

import { from } from 'rxjs';
import { filter, map, mergeMap, toArray } from 'rxjs/operators';
import { File, StrykerOptions, MutationRange } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { SourceFile } from '@stryker-mutator/api/report';
import { isErrnoException, notEmpty } from '@stryker-mutator/util';
import { Minimatch } from 'minimatch';

import { coreTokens } from '../di';
import { StrictReporter } from '../reporters/strict-reporter';
import { MAX_CONCURRENT_FILE_IO } from '../utils/file-utils';
import { defaultOptions } from '../config/options-validator';

import { FileMatcher } from '../config';

import { InputFileCollection } from './input-file-collection';

function toReportSourceFile(file: File): SourceFile {
  return {
    content: file.textContent,
    path: file.name,
  };
}

const ALWAYS_IGNORE = Object.freeze(['node_modules', '.git', '/reports', '/stryker.log']);

export const IGNORE_PATTERN_CHARACTER = '!';
export const MUTATION_RANGE_REGEX = /(.*?):((\d+)(?::(\d+))?-(\d+)(?::(\d+))?)$/;

export class InputFileResolver {
  private readonly mutatePatterns: readonly string[];
  private readonly ignoreRules: readonly string[];

  public static inject = tokens(commonTokens.logger, commonTokens.options, coreTokens.reporter);
  constructor(private readonly log: Logger, { mutate, tempDirName, ignorePatterns }: StrykerOptions, private readonly reporter: StrictReporter) {
    this.mutatePatterns = mutate;
    this.ignoreRules = [...ALWAYS_IGNORE, tempDirName, ...ignorePatterns];
  }

  public async resolve(): Promise<InputFileCollection> {
    const inputFileNames = await this.resolveInputFiles();
    const mutateFiles = this.resolveMutateFiles(inputFileNames);
    const mutationRange = this.resolveMutationRange();
    const files: File[] = await this.readFiles(inputFileNames);
    const inputFileCollection = new InputFileCollection(files, mutateFiles, mutationRange);
    this.reportAllSourceFilesRead(files);
    inputFileCollection.logFiles(this.log, this.ignoreRules);
    return inputFileCollection;
  }

  private resolveMutateFiles(inputFileNames: string[]) {
    return this.filterPatterns(inputFileNames, this.mutatePatterns, isDeepStrictEqual(this.mutatePatterns, defaultOptions().mutate));
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
  private filterPatterns(fileNames: readonly string[], patterns: readonly string[], logAboutUselessPatterns = true): string[] {
    const fileSet = new Set<string>();
    for (const pattern of patterns) {
      if (pattern.startsWith(IGNORE_PATTERN_CHARACTER)) {
        const files = this.filterPattern(fileSet, pattern.substr(1), logAboutUselessPatterns);
        files.forEach((fileName) => fileSet.delete(fileName));
      } else {
        const files = this.filterPattern(fileNames, pattern, logAboutUselessPatterns);
        files.forEach((fileName) => fileSet.add(fileName));
      }
    }
    return Array.from(fileSet);
  }

  private filterPattern(fileNames: Iterable<string>, pattern: string, logAboutUselessPatterns: boolean): string[] {
    if (MUTATION_RANGE_REGEX.exec(pattern)) {
      pattern = pattern.replace(MUTATION_RANGE_REGEX, '$1');
    }
    const matcher = new FileMatcher(pattern);

    const filteredFileNames = [...fileNames].filter((fileName) => matcher.matches(fileName));
    if (!filteredFileNames.length && logAboutUselessPatterns) {
      this.log.warn(`Glob pattern "${pattern}" did not result in any files.`);
    }
    return filteredFileNames;
  }

  private async resolveInputFiles(): Promise<string[]> {
    const ignoreRules = this.ignoreRules.map((pattern) => new Minimatch(pattern, { dot: true, flipNegate: true, nocase: true }));

    const crawlDir = async (dir: string, rootDir = dir): Promise<string[]> => {
      const dirEntries = await fsPromises.readdir(dir, { withFileTypes: true });
      const relativeName = path.posix.relative(rootDir, dir);
      const files = await Promise.all(
        dirEntries
          .filter((dirEntry) => {
            let included = true;
            const entryName = `${relativeName.length ? `${relativeName}/` : ''}${dirEntry.name}${dirEntry.isDirectory() ? '/' : ''}`;
            ignoreRules.forEach((rule) => {
              if (rule.negate !== included) {
                // @ts-expect-error Missing overload in type definitions. See https://github.com/isaacs/minimatch/issues/134
                const match = rule.match(entryName, true) || rule.match(`/${entryName}`, true);
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

  private reportAllSourceFilesRead(allFiles: File[]) {
    this.reporter.onAllSourceFilesRead(allFiles.map(toReportSourceFile));
  }

  private reportSourceFilesRead(textFile: File) {
    this.reporter.onSourceFileRead(toReportSourceFile(textFile));
  }

  private async readFiles(fileNames: string[]): Promise<File[]> {
    const promisedFiles = from(fileNames)
      .pipe(
        mergeMap((fileName) => {
          return this.readFile(fileName);
        }, MAX_CONCURRENT_FILE_IO),
        filter(notEmpty),
        toArray(),
        // Filter the files here, so we force a deterministic instrumentation process
        map((files) => files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)))
      )
      .toPromise();
    return promisedFiles;
  }

  private async readFile(fileName: string): Promise<File | null> {
    try {
      const content = await fsPromises.readFile(fileName);
      const file = new File(fileName, content);
      this.reportSourceFilesRead(file);
      return file;
    } catch (error) {
      if ((isErrnoException(error) && error.code === 'ENOENT') || error.code === 'EISDIR') {
        return null; // file is deleted or a directory.
      } else {
        // Rethrow
        throw error;
      }
    }
  }
}
