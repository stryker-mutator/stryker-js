import * as path from 'path';
import { promises as fs } from 'fs';
import { StringDecoder } from 'string_decoder';

import { StringDecoder } from 'string_decoder';

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { SourceFile } from '@stryker-mutator/api/report';
import { childProcessAsPromised, isErrnoException, normalizeWhitespaces, StrykerError, notEmpty } from '@stryker-mutator/util';

import { coreTokens } from '../di';
import StrictReporter from '../reporters/StrictReporter';
import { glob } from '../utils/fileUtils';
import { defaultOptions } from '../config/OptionsValidator';

import InputFileCollection from './InputFileCollection';

function toReportSourceFile(file: File): SourceFile {
  return {
    content: file.textContent,
    path: file.name,
  };
}

const IGNORE_PATTERN_CHARACTER = '!';

/**
 *  When characters are represented as the octal values of its utf8 encoding
 *  e.g. å becomes \303\245 in git.exe output
 */
function decodeGitLsOutput(line: string) {
  if (line.startsWith('"') && line.endsWith('"')) {
    return line
      .substr(1, line.length - 2)
      .replace(/\\\\/g, '\\')
      .replace(/(?:\\\d+)*/g, (octalEscapeSequence) =>
        new StringDecoder('utf-8').write(
          Buffer.from(
            octalEscapeSequence
              .split('\\')
              .filter(Boolean)
              .map((octal) => parseInt(octal, 8))
          )
        )
      );
  }
  return line;
}

export default class InputFileResolver {
  private readonly mutatePatterns: readonly string[];
  private readonly filePatterns: readonly string[] | undefined;
  private readonly tempDirName: string;

  public static inject = tokens(commonTokens.logger, commonTokens.options, coreTokens.reporter);
  constructor(private readonly log: Logger, { mutate, files, tempDirName }: StrykerOptions, private readonly reporter: StrictReporter) {
    this.tempDirName = tempDirName;
    this.mutatePatterns = mutate;
    if (files) {
      this.filePatterns = files;
    }
  }

  public async resolve(): Promise<InputFileCollection> {
    const [inputFileNames, mutateFiles] = await Promise.all([this.resolveInputFiles(), this.resolveMutateFiles()]);
    const files: File[] = await this.readFiles(inputFileNames);
    const inputFileCollection = new InputFileCollection(files, mutateFiles);
    this.reportAllSourceFilesRead(files);
    inputFileCollection.logFiles(this.log);
    return inputFileCollection;
  }

  private resolveInputFiles() {
    if (this.filePatterns) {
      return this.expand(this.filePatterns);
    } else {
      return this.resolveFilesUsingGit();
    }
  }

  private resolveMutateFiles() {
    return this.expand(this.mutatePatterns, !shallowEquals(this.mutatePatterns, defaultOptions().mutate));

    function shallowEquals(arr1: readonly string[], arr2: readonly string[]): boolean {
      if (arr1.length !== arr2.length) {
        return false;
      } else {
        for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i]) {
            return false;
          }
        }
        return true;
      }
    }
  }

  /**
   * Takes a list of globbing patterns and expands them into files.
   * If a patterns starts with a `!`, it negates the pattern.
   * @param patterns The patterns to expand into files
   */
  private async expand(patterns: readonly string[], logAboutUselessPatterns = true): Promise<string[]> {
    const fileSet = new Set<string>();
    for (const pattern of patterns) {
      if (pattern.startsWith(IGNORE_PATTERN_CHARACTER)) {
        const files = await this.expandPattern(pattern.substr(1), logAboutUselessPatterns);
        files.forEach((fileName) => fileSet.delete(fileName));
      } else {
        const files = await this.expandPattern(pattern, logAboutUselessPatterns);
        files.forEach((fileName) => fileSet.add(fileName));
      }
    }
    return Array.from(fileSet);
  }

  private async expandPattern(globbingExpression: string, logAboutUselessPatterns: boolean): Promise<string[]> {
    const fileNames = (await glob(globbingExpression)).map((relativeFile) => path.resolve(relativeFile));
    if (!fileNames.length && logAboutUselessPatterns) {
      this.log.warn(`Globbing expression "${globbingExpression}" did not result in any files.`);
    }
    return fileNames;
  }

  private async resolveFilesUsingGit(): Promise<string[]> {
    try {
      const { stdout } = await childProcessAsPromised.exec(`git ls-files --others --exclude-standard --cached --exclude /${this.tempDirName}/*`, {
        maxBuffer: 10 * 1000 * 1024,
      });
      const relativeFileNames = stdout
        .toString()
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean) // remove empty lines
        .map(decodeGitLsOutput);

      const fileNames = relativeFileNames.map((relativeFileName) => path.resolve(relativeFileName));
      return fileNames;
    } catch (error) {
      throw new StrykerError(
        normalizeWhitespaces(
          `Cannot determine input files. Either specify a \`files\`
        array in your stryker configuration, or make sure "${process.cwd()}"
        is located inside a git repository`
        ),
        error
      );
    }
  }

  private reportAllSourceFilesRead(allFiles: File[]) {
    this.reporter.onAllSourceFilesRead(allFiles.map(toReportSourceFile));
  }

  private reportSourceFilesRead(textFile: File) {
    this.reporter.onSourceFileRead(toReportSourceFile(textFile));
  }

  private async readFiles(fileNames: string[]): Promise<File[]> {
    const files = await Promise.all(fileNames.map((fileName) => this.readFile(fileName)));
    return files.filter(notEmpty);
  }

  private async readFile(fileName: string): Promise<File | null> {
    try {
      const content = await fs.readFile(fileName);
      const file = new File(fileName, content);
      this.reportSourceFilesRead(file);
      return file;
    } catch (error) {
      if ((isErrnoException(error) && error.code === 'ENOENT') || error.code === 'EISDIR') {
        return null; // file is deleted or a directory. This can be a valid result of the git command
      } else {
        // Rethrow
        throw error;
      }
    }
  }
}
