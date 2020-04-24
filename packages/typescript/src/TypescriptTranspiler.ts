import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import * as ts from 'typescript';

import { getProjectDirectory, getTSConfig, guardTypescriptVersion, isHeaderFile as isDeclarationFile } from './helpers/tsHelpers';
import TranspileFilter from './transpiler/TranspileFilter';
import TranspilingLanguageService from './transpiler/TranspilingLanguageService';
import { TypescriptWithStrykerOptions } from './TypescriptWithStrykerOptions';

export default class TypescriptTranspiler implements Transpiler {
  private languageService: TranspilingLanguageService;
  private readonly filter: TranspileFilter;
  private readonly options: TypescriptWithStrykerOptions;

  public static inject = tokens(commonTokens.options, commonTokens.produceSourceMaps, commonTokens.getLogger);
  constructor(options: StrykerOptions, private readonly produceSourceMaps: boolean, private readonly getLogger: LoggerFactoryMethod) {
    guardTypescriptVersion();
    this.options = options;
    this.filter = TranspileFilter.create(options);
  }

  public transpile(files: readonly File[]): Promise<readonly File[]> {
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
      const resultFiles = this.transpileFiles(files);
      return Promise.resolve(resultFiles);
    }
  }

  private filterIsIncluded(files: readonly File[]): readonly File[] {
    return files.filter((file) => this.filter.isIncluded(file.name));
  }

  private createLanguageService(typescriptFiles: readonly File[]) {
    const tsConfig = getTSConfig(this.options);
    const compilerOptions: ts.CompilerOptions = (tsConfig && tsConfig.options) || {};
    return new TranspilingLanguageService(
      compilerOptions,
      typescriptFiles,
      getProjectDirectory(this.options),
      this.produceSourceMaps,
      this.getLogger
    );
  }

  private transpileFiles(files: readonly File[]): readonly File[] {
    let isSingleOutput = false;
    const fileDictionary: { [name: string]: File } = {};
    files.forEach((file) => (fileDictionary[file.name] = file));
    files.forEach((file) => {
      if (!isDeclarationFile(file.name) && !this.hasJsonOutput(file.name)) {
        if (this.filter.isIncluded(file.name)) {
          // File is to be transpiled. Only emit if more output is expected.
          if (!isSingleOutput) {
            const emitOutput = this.languageService.emit(file.name);
            isSingleOutput = emitOutput.singleResult;
            emitOutput.outputFiles.forEach((file) => (fileDictionary[file.name] = file));
          }

          // Remove original file
          delete fileDictionary[file.name];
        }
      }
    });

    return Object.keys(fileDictionary).map((name) => fileDictionary[name]);
  }
  private hasJsonOutput(fileName: string): boolean {
    return fileName.endsWith('.json') && !getTSConfig(this.options).options.outDir;
  }
}
