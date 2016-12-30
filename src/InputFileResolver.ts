import { InputFile, InputFileDescriptor } from 'stryker-api/core';
import { glob, normalize, isOnlineFile } from './utils/fileUtils';
import * as _ from 'lodash';
import * as log4js from 'log4js';

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

  public resolve(): Promise<InputFile[]> {
    return Promise.all([this.inputFileResolver.resolve(), this.mutateResolver.resolve()]).then(results => {
      const inputFiles = results[0];
      const mutateFiles = results[1];
      this.markAdditionalFilesToMutate(inputFiles, mutateFiles.map(m => m.path));
      this.logFilesToMutate(inputFiles);
      return inputFiles;
    });
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

  private markAdditionalFilesToMutate(allInputFiles: InputFile[], additionalMutateFiles: string[]) {
    let errors: string[] = [];
    additionalMutateFiles.forEach(mutateFile => {
      if (!allInputFiles.filter(inputFile => inputFile.path === mutateFile).length) {
        errors.push(`Could not find mutate file "${mutateFile}" in list of files.`);
      }
    });
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }
    allInputFiles.forEach(file => file.mutated = additionalMutateFiles.some(mutateFile => mutateFile === file.path) || file.mutated);
  }

  private logFilesToMutate(allInputFiles: InputFile[]) {
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
      this.descriptor = <InputFileDescriptor>_.assign({ pattern: descriptor }, DEFAULT_INPUT_FILE_PROPERTIES);
      this.ignore = descriptor.indexOf('!') === 0;
      if (this.ignore) {
        this.descriptor.pattern = descriptor.substring(1);
      }
    } else {
      this.descriptor = descriptor;
    }
  }

  resolve(): Promise<InputFile[]> {
    // When the first expression starts with an '!', we skip that one
    if (this.ignore && !this.previous) {
      return Promise.resolve([]);
    } else {
      // Start the globbing task for the current descriptor
      const globbingTask = this.resolveGlobbingExpression(this.descriptor.pattern)
        .then(filePaths => filePaths.map(filePath => this.createInputFile(filePath)));
      if (this.previous) {
        // If there is a previous globbing expression, resolve that one as well
        return Promise.all([this.previous.resolve(), globbingTask]).then(results => {
          const previousFiles = results[0];
          const currentFiles = results[1];
          // If this expression started with a '!', exclude current files
          if (this.ignore) {
            return previousFiles.filter(previousFile => currentFiles.some(currentFile => previousFile.path !== currentFile.path));
          } else {
            // Only add files which were not already added
            return previousFiles.concat(currentFiles.filter(currentFile => !previousFiles.some(file => file.path === currentFile.path)));
          }
        });
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
    while (expressions.length) {
      current = new PatternResolver(expressions.shift(), current);
    }
    return current;
  }

  private resolveGlobbingExpression(pattern: string): Promise<string[]> {
    if (isOnlineFile(pattern)) {
      return Promise.resolve([pattern]);
    } else {
      return glob(pattern).then(files => {
        if (files.length === 0) {
          this.reportEmptyGlobbingExpression(pattern);
        }
        normalize(files);
        return files;
      });
    }
  }

  private reportEmptyGlobbingExpression(expression: string) {
    log.warn(`Globbing expression "${expression}" did not result in any files.`);
  }

  private createInputFile(path: string): InputFile {
    let inputFile: InputFile = <InputFile>_.assign({ path }, DEFAULT_INPUT_FILE_PROPERTIES, this.descriptor);
    delete (<any>inputFile)['pattern'];
    return inputFile;
  }
}

