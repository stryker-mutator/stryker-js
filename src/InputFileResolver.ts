import { InputFile, InputFileDescriptor } from 'stryker-api/core';
import { glob, normalize } from './utils/fileUtils';
import * as _ from 'lodash';
import * as log4js from 'log4js';

const log = log4js.getLogger('InputFileResolver');
const DEFAULT_INPUT_FILE_PROPERTIES = { mutated: false, included: true };

export default class InputFileResolver {

  private inputFileDescriptors: InputFileDescriptor[];
  private mutateFileExpressions: string[];

  constructor(mutate: string[], allFileExpressions: Array<InputFileDescriptor | string>) {
    this.mutateFileExpressions = mutate || [];
    this.inputFileDescriptors = allFileExpressions.map(maybePattern => {
      if (InputFileResolver.isInputFileDescriptor(maybePattern)) {
        return maybePattern;
      } else {
        return <InputFileDescriptor>_.assign({ pattern: maybePattern }, DEFAULT_INPUT_FILE_PROPERTIES);
      }
    });
  }

  public resolve(): Promise<InputFile[]> {
    let mutateFilePromise = this.resolveMutateFileGlobs();
    return this.resolveInputFileGlobs().then((allInputFiles) => mutateFilePromise.then(additionalMutateFiles => {
      InputFileResolver.markAdditionalFilesToMutate(allInputFiles, additionalMutateFiles);
      InputFileResolver.warnAboutNoFilesToMutate(allInputFiles);
      return allInputFiles;
    }));
  }

  private static markAdditionalFilesToMutate(allInputFiles: InputFile[], additionalMutateFiles: string[]) {
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
  private static warnAboutNoFilesToMutate(allInputFiles: InputFile[]) {
    let mutateFiles = allInputFiles.filter(file => file.mutated);
    if (mutateFiles.length) {
      log.info(`Found ${mutateFiles.length} file(s) to be mutated.`);
    } else {
      log.warn(`No files marked to be mutated, stryker will perform a dry-run without actually mutating anything.`);
    }
  }

  private static reportEmptyGlobbingExpression(expression: string) {
    log.warn(`Globbing expression "${expression}" did not result in any files.`);
  }

  private static isInputFileDescriptor(maybeInputFileDescriptor: InputFileDescriptor | string): maybeInputFileDescriptor is InputFileDescriptor {
    if (_.isObject(maybeInputFileDescriptor)) {
      if (Object.keys(maybeInputFileDescriptor).indexOf('pattern') > -1) {
        return true;
      } else {
        throw Error(`File descriptor ${JSON.stringify(maybeInputFileDescriptor)} is missing mandatory property 'pattern'.`);
      }
    } else {
      return false;
    }
  }

  private resolveMutateFileGlobs(): Promise<string[]> {
    return Promise.all(this.mutateFileExpressions.map(InputFileResolver.resolveFileGlob))
      .then(files => _.flatten(files));
  }

  private resolveInputFileGlobs(): Promise<InputFile[]> {
    return Promise.all(
      this.inputFileDescriptors.map(descriptor => InputFileResolver.resolveFileGlob(descriptor.pattern)
        .then(sourceFiles => sourceFiles.map(sourceFile => InputFileResolver.createInputFile(sourceFile, descriptor))))
    ).then(promises => _.flatten(promises));
  }

  private static createInputFile(path: string, descriptor: InputFileDescriptor): InputFile {
    let inputFile: InputFile = <InputFile>_.assign({ path }, DEFAULT_INPUT_FILE_PROPERTIES, descriptor);
    delete (<any>inputFile)['pattern'];
    return inputFile;
  }


  private static resolveFileGlob(expression: string): Promise<string[]> {
    return glob(expression).then(files => {
      if (files.length === 0) {
        this.reportEmptyGlobbingExpression(expression);
      }
      normalize(files);
      return files;
    });
  }
}