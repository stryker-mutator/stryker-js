import { Config } from 'stryker-api/config';
import { Transpiler, TranspileResult, TranspilerOptions, FileLocation } from 'stryker-api/transpile';
import { File } from 'stryker-api/core';
import { filterOutTypescriptFiles, isTypescriptFile, isTextFile, getCompilerOptions, getProjectDirectory } from './helpers/tsHelpers';
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

  transpile(files: File[]): Promise<TranspileResult> {
    const { typescriptFiles, otherFiles } = filterOutTypescriptFiles(files);
    this.languageService = new TranspilingLanguageService(
      getCompilerOptions(this.config), typescriptFiles, getProjectDirectory(this.config), this.keepSourceMaps);
    const error = this.languageService.getAllSemanticDiagnostics();
    if (error.length) {
      return this.resolveError(error);
    } else {
      const outputFiles = this.languageService.emitAll();
      return this.resolveOutputFiles(otherFiles.concat(outputFiles));
    }
  }

  mutate(file: File): Promise<TranspileResult> {
    if (isTypescriptFile(file) && isTextFile(file)) {
      this.languageService.replace(file.name, file.content);
      const error = this.languageService.getSemanticDiagnostics(file.name);
      const outputFile = this.languageService.emit(file);
      this.languageService.restore();
      if (error.length) {
        return this.resolveError(error);
      } else {
        return this.resolveOutputFiles([outputFile]);
      }
    } else {
      const error = `Cannot perform transpile action on mutated file ${file.name} as it does not seem to be a typescript file`;
      this.log.warn(error);
      return this.resolveError(error);
    }
  }

  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    const outputLocation = this.languageService.getMappedLocationFor(sourceFileLocation);
    if (outputLocation) {
      return this.next.getMappedLocation(outputLocation);
    } else {
      throw new Error(`Could not find mapped location for ${sourceFileLocation.fileName}:${sourceFileLocation.start.line}:${sourceFileLocation.start.column}`);
    }
  }

  private resolveError(error: string): Promise<TranspileResult> {
    return Promise.resolve({
      error,
      outputFiles: []
    });
  }

  private resolveOutputFiles(outputFiles: File[]): Promise<TranspileResult> {
    return Promise.resolve({
      error: null,
      outputFiles
    });
  }
}
