import * as path from 'path';
import * as fs from 'mz/fs';
import * as _ from 'lodash';
import * as log4js from 'log4js';
import { File, InputFileDescriptor, FileDescriptor, FileKind, TextFile, BinaryFile } from 'stryker-api/core';
import { glob, isOnlineFile, determineFileKind } from './utils/fileUtils';
import StrictReporter from './reporters/StrictReporter';

const log = log4js.getLogger('InputFileResolver');

const DEFAULT_INPUT_FILE_PROPERTIES = { mutated: false, included: true };

function testFileToReportFile(textFile: TextFile) {
  return {
    path: textFile.name,
    content: textFile.content
  };
}

export default class InputFileResolver {

  private inputFileResolver: PatternResolver;
  private mutateResolver: PatternResolver;

  constructor(mutate: string[], allFileExpressions: Array<InputFileDescriptor | string>, private reporter: StrictReporter) {
    this.validateFileDescriptor(allFileExpressions);
    this.validateMutationArray(mutate);
    this.mutateResolver = PatternResolver.parse(mutate || []);
    this.inputFileResolver = PatternResolver.parse(allFileExpressions);
  }

  public async resolve(): Promise<File[]> {
    const [inputFileDescriptors, mutateFiles] = await Promise.all([this.inputFileResolver.resolve(), this.mutateResolver.resolve()]);
    const files: File[] = await this.readFiles(inputFileDescriptors);
    this.markAdditionalFilesToMutate(files, mutateFiles.map(m => m.name));
    this.logFilesToMutate(files);
    this.reportAllSourceFilesRead(files);
    return files;
  }

  private validateFileDescriptor(maybeInputFileDescriptors: Array<InputFileDescriptor | string>) {
    maybeInputFileDescriptors.forEach(maybeInputFileDescriptor => {
      if (_.isObject(maybeInputFileDescriptor)) {
        if (Object.keys(maybeInputFileDescriptor).indexOf('pattern') === -1) {
          throw Error(`File descriptor ${JSON.stringify(maybeInputFileDescriptor)} is missing mandatory property 'pattern'.`);
        } else {
          maybeInputFileDescriptor = maybeInputFileDescriptor as InputFileDescriptor;
          if (isOnlineFile(maybeInputFileDescriptor.pattern) && maybeInputFileDescriptor.mutated) {
            throw new Error(`Cannot mutate web url "${maybeInputFileDescriptor.pattern}".`);
          }
        }
      }
    });
  }

  private validateMutationArray(mutationArray: Array<string>) {
    if (mutationArray) {
      mutationArray.forEach(mutation => {
        if (isOnlineFile(mutation)) {
          throw new Error(`Cannot mutate web url "${mutation}".`);
        }
      });
    }
  }

  private markAdditionalFilesToMutate(allInputFiles: File[], additionalMutateFiles: string[]) {
    const errors: string[] = [];
    additionalMutateFiles.forEach(mutateFile => {
      if (!allInputFiles.filter(inputFile => inputFile.name === mutateFile).length) {
        errors.push(`Could not find mutate file "${mutateFile}" in list of files.`);
      }
    });
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }
    allInputFiles.forEach(file => file.mutated = additionalMutateFiles.some(mutateFile => mutateFile === file.name) || file.mutated);
  }

  private logFilesToMutate(allInputFiles: File[]) {
    let mutateFiles = allInputFiles.filter(file => file.mutated);
    if (mutateFiles.length) {
      log.info(`Found ${mutateFiles.length} of ${allInputFiles.length} file(s) to be mutated.`);
    } else {
      log.warn(`No files marked to be mutated, stryker will perform a dry-run without actually mutating anything.`);
    }
    if (log.isDebugEnabled) {
      log.debug('All input files in order:%s', allInputFiles.map(file => '\n\t' + JSON.stringify(file)));
    }
  }

  private reportAllSourceFilesRead(allFiles: File[]) {
    this.reporter.onAllSourceFilesRead(this.filterTextFiles(allFiles).map(testFileToReportFile));
  }

  private reportSourceFilesRead(textFile: TextFile) {
    this.reporter.onSourceFileRead(testFileToReportFile(textFile));
  }

  private filterTextFiles(files: File[]): TextFile[] {
    return files.filter(file => file.kind === FileKind.Text) as TextFile[];
  }

  private readFiles(inputFileDescriptors: FileDescriptor[]): Promise<File[]> {
    return Promise.all(inputFileDescriptors.map(file => this.readInputFile(file)));
  }

  private readInputFile(descriptor: FileDescriptor): Promise<File> {
    switch (descriptor.kind) {
      case FileKind.Web:
        const web: { kind: FileKind.Web } = { kind: FileKind.Web };
        return Promise.resolve(Object.assign({}, descriptor, web));
      case FileKind.Text:
        return this.readLocalFile(descriptor, descriptor.kind).then(textFile => {
          this.reportSourceFilesRead(textFile as TextFile);
          return textFile;
        });
      default:
        return this.readLocalFile(descriptor, descriptor.kind);
    }
  }

  private readLocalFile(descriptor: FileDescriptor, kind: FileKind.Text | FileKind.Binary): Promise<TextFile | BinaryFile> {
    return this.readInputFileContent(descriptor.name, kind).then(content => ({
      name: descriptor.name,
      kind: descriptor.kind,
      content,
      included: descriptor.included,
      mutated: descriptor.mutated
    }) as TextFile | BinaryFile);
  }

  private readInputFileContent(fileName: string, kind: FileKind.Binary | FileKind.Text): Promise<Buffer | string> {
    if (kind === FileKind.Binary) {
      return fs.readFile(fileName);
    } else {
      return fs.readFile(fileName, 'utf8');
    }
  }
}

class PatternResolver {

  private ignore = false;
  private descriptor: InputFileDescriptor;

  constructor(descriptor: InputFileDescriptor | string, private previous?: PatternResolver) {
    if (typeof descriptor === 'string') { // mutator array is a string array
      this.descriptor = Object.assign({ pattern: descriptor }, DEFAULT_INPUT_FILE_PROPERTIES);
      this.ignore = descriptor.indexOf('!') === 0;
      if (this.ignore) {
        this.descriptor.pattern = descriptor.substring(1);
      }
    } else {
      this.descriptor = descriptor;
    }
  }

  async resolve(): Promise<FileDescriptor[]> {
    // When the first expression starts with an '!', we skip that one
    if (this.ignore && !this.previous) {
      return Promise.resolve([]);
    } else {
      // Start the globbing task for the current descriptor
      const globbingTask = this.resolveGlobbingExpression(this.descriptor.pattern)
        .then(filePaths => filePaths.map(filePath => this.createInputFile(filePath)));

      // If there is a previous globbing expression, resolve that one as well
      if (this.previous) {
        const results = await Promise.all([this.previous.resolve(), globbingTask]);
        const previousFiles = results[0];
        const currentFiles = results[1];
        // If this expression started with a '!', exclude current files
        if (this.ignore) {
          return previousFiles.filter(previousFile => currentFiles.every(currentFile => previousFile.name !== currentFile.name));
        } else {
          // Only add files which were not already added
          return previousFiles.concat(currentFiles.filter(currentFile => !previousFiles.some(file => file.name === currentFile.name)));
        }
      } else {
        return globbingTask;
      }
    }
  }

  static empty(): PatternResolver {
    const emptyResolver = new PatternResolver('');
    emptyResolver.ignore = true;
    return emptyResolver;
  }

  static parse(inputFileExpressions: Array<string | InputFileDescriptor>): PatternResolver {
    const expressions = inputFileExpressions.map(i => i); // work on a copy as we're changing the array state
    let current = PatternResolver.empty();
    let expression = expressions.shift();
    while (expression) {
      current = new PatternResolver(expression, current);
      expression = expressions.shift();
    }
    return current;
  }

  private async resolveGlobbingExpression(pattern: string): Promise<string[]> {
    if (isOnlineFile(pattern)) {
      return Promise.resolve([pattern]);
    } else {
      let files = await glob(pattern);
      if (files.length === 0) {
        this.reportEmptyGlobbingExpression(pattern);
      }
      return files.map((f) => path.resolve(f));
    }
  }

  private reportEmptyGlobbingExpression(expression: string) {
    log.warn(`Globbing expression "${expression}" did not result in any files.`);
  }

  private createInputFile(name: string): FileDescriptor {
    const inputFile = _.assign({ name, kind: determineFileKind(name) }, DEFAULT_INPUT_FILE_PROPERTIES, this.descriptor);
    delete (<any>inputFile)['pattern'];
    return inputFile;
  }
}

