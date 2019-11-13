import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { File } from '@stryker-mutator/api/core';
import * as ts from 'typescript';

import flatMap = require('lodash.flatmap');

import { isJavaScriptFile, isMapFile, normalizeFileForTypescript, normalizeFileFromTypescript } from '../helpers/tsHelpers';

import ScriptFile from './ScriptFile';

const libRegex = /^lib\.(?:\w|\.)*\.?d\.ts$/;

export interface EmitOutput {
  singleResult: boolean;
  outputFiles: File[];
}

export default class TranspilingLanguageService {
  private readonly languageService: ts.LanguageService;
  private readonly logger: Logger;
  private readonly compilerOptions: ts.CompilerOptions;
  private readonly files: ts.MapLike<ScriptFile> = Object.create(null);
  private readonly diagnosticsFormatter: ts.FormatDiagnosticsHost;

  constructor(
    compilerOptions: Readonly<ts.CompilerOptions>,
    rootFiles: readonly File[],
    private readonly projectDirectory: string,
    private readonly produceSourceMaps: boolean,
    getLogger: LoggerFactoryMethod
  ) {
    this.compilerOptions = this.adaptCompilerOptions(compilerOptions);
    rootFiles.forEach(file => (this.files[file.name] = new ScriptFile(file.name, file.textContent)));
    const host = this.createLanguageServiceHost();
    this.languageService = ts.createLanguageService(host);
    this.logger = getLogger(TranspilingLanguageService.name);
    this.diagnosticsFormatter = {
      getCanonicalFileName: fileName => fileName,
      getCurrentDirectory: () => projectDirectory,
      getNewLine: () => os.EOL
    };
  }

  /**
   * Adapts compiler options to emit sourceMap files and disable other options for performance reasons
   *
   * @param source The unchanged compiler options
   */
  private adaptCompilerOptions(source: ts.CompilerOptions) {
    const compilerOptions = Object.assign({}, source);
    compilerOptions.sourceMap = this.produceSourceMaps;
    compilerOptions.inlineSourceMap = false;
    compilerOptions.declaration = false;
    return compilerOptions;
  }

  /**
   * Replaces the content of the given text files
   * @param mutantCandidate The mutant used to replace the original source
   */
  public replace(replacements: readonly File[]) {
    replacements.forEach(replacement => this.files[replacement.name].replace(replacement.textContent));
  }

  public getSemanticDiagnostics(files: readonly File[]) {
    const fileNames = files.map(file => file.name);
    const errors = flatMap(fileNames, fileName => this.languageService.getSemanticDiagnostics(normalizeFileForTypescript(fileName)));
    return ts.formatDiagnostics(errors, this.diagnosticsFormatter);
  }

  /**
   * Get the output text file for given source file
   * @param sourceFile Emit output file based on this source file
   * @return  Map<TextFile> Returns a map of source file names with their output files.
   *          If all output files are bundled together, only returns the output file once using the first file as key
   */
  public emit(fileName: string): EmitOutput {
    const emittedFiles = this.languageService.getEmitOutput(fileName).outputFiles;
    const jsFile = emittedFiles.find(isJavaScriptFile);
    const mapFile = emittedFiles.find(isMapFile);
    if (jsFile) {
      const outputFiles: File[] = [new File(normalizeFileFromTypescript(jsFile.name), jsFile.text)];
      if (mapFile) {
        outputFiles.push(new File(normalizeFileFromTypescript(mapFile.name), mapFile.text));
      }
      return { singleResult: !!this.compilerOptions.outFile, outputFiles };
    } else {
      throw new Error(`Emit error! Could not emit file ${fileName}`);
    }
  }

  private createLanguageServiceHost(): ts.LanguageServiceHost {
    return {
      directoryExists: ts.sys.directoryExists,
      fileExists: ts.sys.fileExists,
      getCompilationSettings: () => this.compilerOptions,
      getCurrentDirectory: () => path.resolve(this.projectDirectory),
      getDefaultLibFileName: ts.getDefaultLibFileName,
      getDirectories: ts.sys.getDirectories,
      getScriptFileNames: () => Object.keys(this.files),
      getScriptSnapshot: fileName => {
        this.pullFileIntoMemoryIfNeeded(fileName);
        return this.files[fileName] && ts.ScriptSnapshot.fromString(this.files[fileName].content);
      },
      getScriptVersion: fileName => {
        this.pullFileIntoMemoryIfNeeded(fileName);
        return this.files[fileName] && this.files[fileName].version.toString();
      },
      readDirectory: ts.sys.readDirectory,
      readFile: ts.sys.readFile
    };
  }

  private pullFileIntoMemoryIfNeeded(fileName: string) {
    if (!this.files[fileName]) {
      const resolvedFile = this.resolveFileName(fileName);
      if (fs.existsSync(resolvedFile)) {
        this.logger.debug('Pulling file into memory: %s', fileName);
        this.files[fileName] = new ScriptFile(fileName, fs.readFileSync(resolvedFile, 'utf8'));
      } else {
        this.logger.error(`File ${resolvedFile} does not exist.`);
      }
    }
  }

  private resolveFileName(fileName: string) {
    if (libRegex.exec(fileName)) {
      const typescriptLocation = require.resolve('typescript');
      const newFileName = path.resolve(path.dirname(typescriptLocation), fileName);
      this.logger.debug(`Resolving lib file ${fileName} to ${newFileName}`);
      return newFileName;
    }

    return fileName;
  }
}
