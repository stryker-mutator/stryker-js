import { Config } from 'stryker-api/config';
import { Transpiler, TranspileResult, TranspilerOptions, FileLocation } from 'stryker-api/transpile';
import { File } from 'stryker-api/core';
import { filterOutTypescriptFiles, getCompilerOptions, getProjectDirectory } from './helpers/tsHelpers';
import TranspilingLanguageService from './transpiler/TranspilingLanguageService';
import { Logger, getLogger } from 'log4js';

export default class TypescriptTranspiler implements Transpiler {
  private languageService: TranspilingLanguageService;
  private readonly next: Transpiler;
  private readonly config: Config;
  private readonly keepSourceMaps: boolean;
  private readonly log: Logger;

  constructor(options: TranspilerOptions) {
    this.log = getLogger(TypescriptTranspiler.name);
    this.config = options.config;
    this.keepSourceMaps = options.keepSourceMaps;
  }

  transpile(files: File[]): TranspileResult {
    const { typescriptFiles, otherFiles } = filterOutTypescriptFiles(files);
    this.languageService = new TranspilingLanguageService(
      getCompilerOptions(this.config), typescriptFiles, getProjectDirectory(this.config), this.keepSourceMaps);
    return this.transpileAndResult(typescriptFiles, otherFiles);
  }

  mutate(files: File[]): TranspileResult {
    const { typescriptFiles, otherFiles } = filterOutTypescriptFiles(files);
    typescriptFiles.map(file => this.languageService.replace(file.name, file.content));
    const result = this.transpileAndResult(typescriptFiles, otherFiles);
    this.languageService.restore();
    return result;
  }

  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    const outputLocation = this.languageService.getMappedLocationFor(sourceFileLocation);
    if (outputLocation) {
      return this.next.getMappedLocation(outputLocation);
    } else {
      throw new Error(`Could not find mapped location for ${sourceFileLocation.fileName}:${sourceFileLocation.start.line}:${sourceFileLocation.start.column}`);
    }
  }

  private transpileAndResult(typescriptFiles: File[], otherFiles: File[]) {
    const error = this.languageService.getAllSemanticDiagnostics();
    if (error.length) {
      return this.createErrorResult(error);
    } else {
      const outputFiles = this.languageService.emit(typescriptFiles);
      return this.createSuccessResult(otherFiles.concat(outputFiles));
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
