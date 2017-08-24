import { File, InputFileDescriptor } from 'stryker-api/core';
import { glob, isOnlineFile, isBinaryFile } from './utils/fileUtils';
import * as _ from 'lodash';
import * as log4js from 'log4js';
import * as path from 'path';
import * as fs from 'mz/fs';

const log = log4js.getLogger('InputFileResolver');

const DEFAULT_INPUT_FILE_PROPERTIES = { mutated: false, included: true };

export default class InputFileResolver {

  private inputFileResolver: PatternResolver;
  private mutateResolver: PatternResolver;

  constructor(mutate: string[], allFileExpressions: Array<InputFileDescriptor | string>) {
    this.validateFileDescriptor(allFileExpressions);
    this.validateMutationArray(mutate);
    this.mutateResolver = PatternResolver.parse(mutate || []);
    this.inputFileResolver = PatternResolver.parse(allFileExpressions);
  }

  public async resolve(): Promise<File[]> {
    const [inputFiles, mutateFiles] = await Promise.all([this.inputFileResolver.resolve(), this.mutateResolver.resolve()]);
    this.markAdditionalFilesToMutate(inputFiles, mutateFiles.map(m => m.name));
    this.logFilesToMutate(inputFiles);
    return inputFiles;
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

  async resolve(): Promise<File[]> {
    // When the first expression starts with an '!', we skip that one
    if (this.ignore && !this.previous) {
      return Promise.resolve([]);
    } else {
      // Start the globbing task for the current descriptor
      const globbingTask = this.resolveGlobbingExpression(this.descriptor.pattern)
        .then(filePaths => Promise.all(filePaths.map(filePath => this.readInputFile(filePath))));

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

  private readInputFile(name: string): Promise<File> {
    return this.readInputFileContent(name)
      .then(content => ({
        name,
        content: content as string,
        mutated: !!this.descriptor.mutated,
        included: !!this.descriptor.included
      }));
  }

  private readInputFileContent(name: string): Promise<Buffer | string> {
    if (isBinaryFile(name)) {
      return fs.readFile(name);
    } else {
      return fs.readFile(name, 'utf8');
    }
  }
}

