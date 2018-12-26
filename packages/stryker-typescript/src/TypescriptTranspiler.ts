import flatMap = require('lodash.flatmap');
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { Transpiler, TranspilerOptions } from 'stryker-api/transpile';
import * as ts from 'typescript';
import { getProjectDirectory, getTSConfig, guardTypescriptVersion, isHeaderFile } from './helpers/tsHelpers';
import TranspileFilter from './transpiler/TranspileFilter';
import TranspilingLanguageService from './transpiler/TranspilingLanguageService';

export default class TypescriptTranspiler implements Transpiler {
  private readonly config: Config;
  private readonly filter: TranspileFilter;
  private languageService: TranspilingLanguageService;
  private readonly produceSourceMaps: boolean;

  constructor(options: TranspilerOptions) {
    guardTypescriptVersion();
    this.config = options.config;
    this.produceSourceMaps = options.produceSourceMaps;
    this.filter = TranspileFilter.create(this.config);
  }

  public transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    const typescriptFiles = this.filterIsIncluded(files);
    if (this.languageService) {
      this.languageService.replace(typescriptFiles);
    } else {
      this.languageService = this.createLanguageService(typescriptFiles);
    }
    const error = this.languageService.getSemanticDiagnostics(typescriptFiles);
    if (error.length) {
      return Promise.reject(new Error(error));
    } else {
      const resultFiles: File[] = this.transpileFiles(files);

      return Promise.resolve(resultFiles);
    }
  }

  private createLanguageService(typescriptFiles: ReadonlyArray<File>) {
    const tsConfig = getTSConfig(this.config);
    const compilerOptions: ts.CompilerOptions = (tsConfig && tsConfig.options) || {};

    return new TranspilingLanguageService(
      compilerOptions, typescriptFiles, getProjectDirectory(this.config), this.produceSourceMaps);
  }

  private filterIsIncluded(files: ReadonlyArray<File>): ReadonlyArray<File> {
    return files.filter(file => this.filter.isIncluded(file.name));
  }

  private transpileFiles(files: ReadonlyArray<File>) {
    let isSingleOutput = false;

    // Keep original order of the files using a flatmap.
    return flatMap(files, file => {
      if (!isHeaderFile(file.name) && this.filter.isIncluded(file.name)) {
        // File is to be transpiled. Only emit if more output is expected.
        if (isSingleOutput) {
          return [];
        } else {
          const emitOutput = this.languageService.emit(file.name);
          isSingleOutput = emitOutput.singleResult;

          return emitOutput.outputFiles;
        }
      } else {
        // File is not an included typescript file
        return [file];
      }
    });
  }
}
