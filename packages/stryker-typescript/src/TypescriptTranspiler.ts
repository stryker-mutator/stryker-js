import flatMap = require('lodash.flatmap');
import { Config } from 'stryker-api/config';
import { Transpiler, TranspileResult, TranspilerOptions } from 'stryker-api/transpile';
import { File } from 'stryker-api/core';
import { filterTypescriptFiles, getCompilerOptions, getProjectDirectory, isHeaderFile, guardTypescriptVersion, isTypescriptFile } from './helpers/tsHelpers';
import TranspilingLanguageService from './transpiler/TranspilingLanguageService';
import { setGlobalLogLevel } from 'log4js';

export default class TypescriptTranspiler implements Transpiler {
  private languageService: TranspilingLanguageService;
  private readonly config: Config;
  private readonly produceSourceMaps: boolean;

  constructor(options: TranspilerOptions) {
    guardTypescriptVersion();
    setGlobalLogLevel(options.config.logLevel);
    this.config = options.config;
    this.produceSourceMaps = options.produceSourceMaps;
  }

  transpile(files: File[]): Promise<TranspileResult> {
    const typescriptFiles = filterTypescriptFiles(files)
      .filter(file => file.transpiled);
    if (!this.languageService) {
      this.languageService = new TranspilingLanguageService(
        getCompilerOptions(this.config), typescriptFiles, getProjectDirectory(this.config), this.produceSourceMaps);
    } else {
      this.languageService.replace(typescriptFiles);
    }
    return Promise.resolve(this.transpileAndResult(typescriptFiles, files));
  }

  private transpileAndResult(typescriptFiles: File[], allFiles: File[]) {
    const error = this.languageService.getSemanticDiagnostics(typescriptFiles.map(file => file.name));
    if (error.length) {
      return this.createErrorResult(error);
    } else {
      // Keep original order of the files
      let moreOutput = true;
      const resultFiles: File[] = flatMap(allFiles, file => {
        if (isHeaderFile(file)) {
          // Header files are not compiled to output
          return [];
        } else if (file.transpiled && isTypescriptFile(file)) {
          // File is a typescript file. Only emit if more output is expected.
          if (moreOutput) {
            const emitOutput = this.languageService.emit(file);
            moreOutput = !emitOutput.singleResult;
            return emitOutput.outputFiles;
          } else {
            return [];
          }
        } else {
          // File is not a typescript file
          return [file];
        }
      });
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