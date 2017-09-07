import { Config } from 'stryker-api/config';
import { Transpiler, TranspileResult, TranspilerOptions, FileLocation } from 'stryker-api/transpile';
import { File } from 'stryker-api/core';
import { filterOutTypescriptFiles, getCompilerOptions, getProjectDirectory, isToBeTranspiled, filterEmpty } from './helpers/tsHelpers';
import TranspilingLanguageService from './transpiler/TranspilingLanguageService';
import { setGlobalLogLevel } from 'log4js';

export default class TypescriptTranspiler implements Transpiler {
  private languageService: TranspilingLanguageService;
  private readonly next: Transpiler;
  private readonly config: Config;
  private readonly keepSourceMaps: boolean;

  constructor(options: TranspilerOptions) {
    setGlobalLogLevel(options.config.logLevel);
    this.config = options.config;
    this.keepSourceMaps = options.keepSourceMaps;
  }

  transpile(files: File[]): TranspileResult {
    const typescriptFiles = filterOutTypescriptFiles(files);
    if (!this.languageService) {
      this.languageService = new TranspilingLanguageService(
        getCompilerOptions(this.config), typescriptFiles, getProjectDirectory(this.config), this.keepSourceMaps);
    } else {
      this.languageService.replace(typescriptFiles);
    }
    return this.transpileAndResult(typescriptFiles, files);
  }

  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    const outputLocation = this.languageService.getMappedLocationFor(sourceFileLocation);
    if (outputLocation) {
      return this.next.getMappedLocation(outputLocation);
    } else {
      throw new Error(`Could not find mapped location for ${sourceFileLocation.fileName}:${sourceFileLocation.start.line}:${sourceFileLocation.start.column}`);
    }
  }

  private transpileAndResult(typescriptFiles: File[], allFiles: File[]) {
    const error = this.languageService.getSemanticDiagnostics(typescriptFiles.map(file => file.name));
    if (error.length) {
      return this.createErrorResult(error);
    } else {
      const outputFiles = this.languageService.emit(typescriptFiles);
      // Keep original order of the files
      const resultFiles = filterEmpty(allFiles.map(file => {
        if (isToBeTranspiled(file)) {
          return outputFiles[file.name];
        } else {
          return file;
        }
      }));
      return this.createSuccessResult(resultFiles);
    }
  }

  private createErrorResult(error: string): TranspileResult {
    return {
      error,
      outputFiles: []
    };
  }

  private createSuccessResult(outputFiles: File[]): TranspileResult {
    return {
      error: null,
      outputFiles
    };
  }
}