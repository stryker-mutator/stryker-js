import flatMap = require('lodash.flatmap');
import * as ts from 'typescript';
import { Transpiler } from 'stryker-api/transpile';
import { File, StrykerOptions } from 'stryker-api/core';
import { getTSConfig, getProjectDirectory, guardTypescriptVersion, isHeaderFile } from './helpers/tsHelpers';
import TranspilingLanguageService from './transpiler/TranspilingLanguageService';
import TranspileFilter from './transpiler/TranspileFilter';
import { tokens, commonTokens } from 'stryker-api/plugin';

export default class TypescriptTranspiler implements Transpiler {
  private languageService: TranspilingLanguageService;
  private readonly filter: TranspileFilter;

  public static inject = tokens(commonTokens.options, commonTokens.produceSourceMaps);
  constructor(private readonly options: StrykerOptions, private readonly produceSourceMaps: boolean) {
    guardTypescriptVersion();
    this.filter = TranspileFilter.create(this.options);
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

  private filterIsIncluded(files: ReadonlyArray<File>): ReadonlyArray<File> {
    return files.filter(file => this.filter.isIncluded(file.name));
  }

  private createLanguageService(typescriptFiles: ReadonlyArray<File>) {
    const tsConfig = getTSConfig(this.options);
    const compilerOptions: ts.CompilerOptions = (tsConfig && tsConfig.options) || {};
    return new TranspilingLanguageService(
      compilerOptions, typescriptFiles, getProjectDirectory(this.options), this.produceSourceMaps);
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
