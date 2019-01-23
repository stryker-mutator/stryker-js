import * as path from 'path';
import { fsAsPromised, isErrnoException } from '@stryker-mutator/util';
import { childProcessAsPromised } from '@stryker-mutator/util';
import { getLogger } from 'stryker-api/logging';
import { File } from 'stryker-api/core';
import { glob } from '../utils/fileUtils';
import StrictReporter from '../reporters/StrictReporter';
import { SourceFile } from 'stryker-api/report';
import { StrykerError } from '@stryker-mutator/util';
import InputFileCollection from './InputFileCollection';
import { normalizeWhiteSpaces, filterEmpty } from '../utils/objectUtils';
import { Config } from 'stryker-api/config';

function toReportSourceFile(file: File): SourceFile {
  return {
    content: file.textContent,
    path: file.name
  };
}

const IGNORE_PATTERN_CHARACTER = '!';

export default class InputFileResolver {
  private readonly log = getLogger(InputFileResolver.name);
  private readonly mutatePatterns: ReadonlyArray<string>;
  private readonly filePatterns: ReadonlyArray<string> | undefined;

  constructor(
    mutate: string[],
    files: string[] | undefined,
    private readonly reporter: StrictReporter
  ) {
    this.mutatePatterns = this.normalize(mutate || []);
    if (files) {
      this.filePatterns = this.normalize(files);
    }
  }

  public async resolve(): Promise<InputFileCollection> {
    const [inputFileNames, mutateFiles] = await Promise.all([
      this.resolveInputFiles(),
      this.resolveMutateFiles()
    ]);
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
    return this.expand(this.mutatePatterns, !shallowEquals(this.mutatePatterns, new Config().mutate));

    function shallowEquals(arr1: ReadonlyArray<string>, arr2: ReadonlyArray<string>): boolean {
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
  private async expand(patterns: ReadonlyArray<string>, logAboutUselessPatterns = true): Promise<string[]> {
    const fileSet = new Set<string>();
    for (const pattern of patterns) {
      if (pattern.startsWith(IGNORE_PATTERN_CHARACTER)) {
        const files = await this.expandPattern(pattern.substr(1), logAboutUselessPatterns);
        files.forEach(fileName => fileSet.delete(fileName));
      } else {
        const files = await this.expandPattern(pattern, logAboutUselessPatterns);
        files.forEach(fileName => fileSet.add(fileName));
      }
    }
    return Array.from(fileSet);
  }

  private async expandPattern(globbingExpression: string, logAboutUselessPatterns: boolean): Promise<string[]> {
    const fileNames = (await glob(globbingExpression)).map(relativeFile => path.resolve(relativeFile));
    if (!fileNames.length && logAboutUselessPatterns) {
      this.log.warn(
        `Globbing expression "${globbingExpression}" did not result in any files.`
      );
    }
    return fileNames;
  }

  private async resolveFilesUsingGit(): Promise<string[]> {
    try {
      const { stdout } = await childProcessAsPromised.exec(
        'git ls-files --others --exclude-standard --cached --exclude .stryker-tmp',
        { maxBuffer: 10 * 1000 * 1024 }
      );
      const fileNames = stdout.toString()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line) // remove empty lines
        .map(relativeFileName => path.resolve(relativeFileName));
      return fileNames;
    } catch (error) {
      throw new StrykerError(normalizeWhiteSpaces(
        `Cannot determine input files. Either specify a \`files\`
        array in your stryker configuration, or make sure "${process.cwd()}"
        is located inside a git repository`),
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

  private readFiles(files: string[]): Promise<File[]> {
    return Promise.all(files.map(fileName => this.readFile(fileName))).then(
      filterEmpty
    );
  }

  private normalize(
    inputFileExpressions: (string | { pattern: string })[]
  ): string[] {
    const inputFileDescriptorObjects: { pattern: string }[] = [];
    const globExpressions = inputFileExpressions.map(expression => {
      if (typeof expression === 'string') {
        return expression;
      } else {
        inputFileDescriptorObjects.push(expression);
        return expression.pattern;
      }
    });
    if (inputFileDescriptorObjects.length) {
      this.log.warn(
        normalizeWhiteSpaces(`
      DEPRECATED: Using the \`InputFileDescriptor\` syntax to
      select files is no longer supported. We'll assume: ${JSON.stringify(inputFileDescriptorObjects)}
       can be migrated to ${JSON.stringify(inputFileDescriptorObjects.map(_ => _.pattern))} for this
        mutation run. Please move any files to mutate into the \`mutate\` array (top level stryker option).
      You can fix this warning in 2 ways:
      1) If your project is under git version control, you can remove the "files" patterns all together.
      Stryker can figure it out for you.
      2) If your project is not under git version control or you need ignored files in your sandbox, you can replace the
      \`InputFileDescriptor\` syntax with strings (as done for this test run).`)
      );
    }
    return globExpressions;
  }

  private readFile(fileName: string): Promise<File | null> {
    return fsAsPromised
      .readFile(fileName)
      .then((content: Buffer) => new File(fileName, content))
      .then((file: File) => {
        this.reportSourceFilesRead(file);
        return file;
      })
      .catch(error => {
        if (
          (isErrnoException(error) && error.code === 'ENOENT') ||
          error.code === 'EISDIR'
        ) {
          return null; // file is deleted or a directory. This can be a valid result of the git command
        } else {
          // Rethrow
          throw error;
        }
      });
  }
}
