import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { Logger, getLogger } from 'log4js';
import flatMap = require('lodash.flatmap');
import { TextFile, FileDescriptor, FileKind } from 'stryker-api/core';
import { FileLocation } from 'stryker-api/transpile';
import ScriptFile from './ScriptFile';
import OutputFile from './OutputFile';

const libRegex = /^lib\.(?:\w|\.)*\.?d\.ts$/;

export default class TranspilingLanguageService {
  private languageService: ts.LanguageService;

  private compilerOptions: ts.CompilerOptions;
  private readonly files: ts.MapLike<ScriptFile>;
  private readonly outputFiles: ts.MapLike<OutputFile>;
  private logger: Logger;
  private readonly diagnosticsFormatter: ts.FormatDiagnosticsHost;

  constructor(compilerOptions: Readonly<ts.CompilerOptions>, private rootFiles: TextFile[], private projectDirectory: string, private keepSourceMaps: boolean) {
    this.logger = getLogger(TranspilingLanguageService.name);
    this.files = Object.create(null);
    this.outputFiles = Object.create(null);
    this.compilerOptions = this.adaptCompilerOptions(compilerOptions);
    rootFiles.forEach(file => this.files[file.name] = new ScriptFile(file.name, file.content));
    const host = this.createLanguageServiceHost();

    this.languageService = ts.createLanguageService(host);
    this.diagnosticsFormatter = {
      getCurrentDirectory: () => projectDirectory,
      getCanonicalFileName: fileName => fileName,
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
    compilerOptions.sourceMap = this.keepSourceMaps;
    compilerOptions.inlineSourceMap = false;
    compilerOptions.declaration = false;
    return compilerOptions;
  }

  /**
   * Replaces the content of the given text files
   * @param mutantCandidate The mutant used to replace the original source
   */
  replace(replacements: TextFile[]) {
    replacements.forEach(replacement =>
      this.files[replacement.name].replace(replacement.content));
  }

  getSemanticDiagnostics(fileNames: string[]) {
    const errors = flatMap(fileNames, fileName => this.languageService.getSemanticDiagnostics(fileName));
    return ts.formatDiagnostics(errors, this.diagnosticsFormatter);
  }

  /**
   * Get the output text for given source files
   * @param sourceFiles Emit output files based on given source files
   * @return  Map<TextFile> Returns a map of source file names with their output files.
   *          If all output files are bundled together, only returns the output file once using the first file as key
   */
  emit(sourceFiles: FileDescriptor[] = this.rootFiles): ts.MapLike<TextFile> {
    if (this.compilerOptions.outFile) {
      // If it is a single out file, just transpile one file as it is all bundled together anyway.
      const outputFile = this.mapToOutput(sourceFiles[0]);
      // All output is bundled together. Configure this output file for all root files.
      this.rootFiles.forEach(rootFile => this.outputFiles[rootFile.name] = outputFile);

      return {
        [sourceFiles[0].name]: {
          name: outputFile.name,
          content: outputFile.content,
          mutated: sourceFiles[0].mutated,
          kind: FileKind.Text,
          transpiled: true, // Override transpiled. If a next transpiler comes along, definitely pick up this file.
          included: true // Override included, as it should be included when there is only one output file
        }
      };
    } else {
      return sourceFiles.reduce((fileMap, sourceFile) => {
        const outputFile = this.mapToOutput(sourceFile);
        this.outputFiles[sourceFile.name] = outputFile;
        const textOutput: TextFile = {
          name: outputFile.name,
          content: outputFile.content,
          mutated: sourceFile.mutated,
          included: sourceFile.included,
          transpiled: sourceFile.transpiled,
          kind: FileKind.Text,
        };
        fileMap[sourceFile.name] = textOutput;
        return fileMap;
      }, Object.create(null));
    }
  }

  getMappedLocationFor(sourceFileLocation: FileLocation): FileLocation | null {
    const outputFile = this.outputFiles[sourceFileLocation.fileName];
    if (outputFile) {
      const location = this.outputFiles[sourceFileLocation.fileName]
        .getMappedLocation(sourceFileLocation);
      if (location) {
        const targetFileLocation = location as FileLocation;
        targetFileLocation.fileName = outputFile.name;
        return targetFileLocation;
      }
    }
    return null;
  }

  private mapToOutput(fileDescriptor: FileDescriptor) {
    const outputFiles = this.languageService.getEmitOutput(fileDescriptor.name).outputFiles;
    const mapFile = outputFiles.find(file => file.name.endsWith('.js.map'));
    const jsFile = outputFiles.find(file => file.name.endsWith('.js'));
    if (jsFile) {
      return new OutputFile(jsFile.name, jsFile.text, mapFile ? mapFile.text : '');
    } else {
      throw new Error(`Emit error! Could not emit file ${fileDescriptor.name}`);
    }
  }

  private createLanguageServiceHost(): ts.LanguageServiceHost {
    return {
      getCompilationSettings: () => this.compilerOptions,
      getScriptFileNames: () => Object.keys(this.files),
      getScriptVersion: (fileName) => {
        this.pullFileIntoMemoryIfNeeded(fileName);
        return this.files[fileName] && this.files[fileName].version.toString();
      },
      getScriptSnapshot: (fileName) => {
        this.pullFileIntoMemoryIfNeeded(fileName);
        return this.files[fileName] && ts.ScriptSnapshot.fromString(this.files[fileName].content);
      },
      getCurrentDirectory: () => path.resolve(this.projectDirectory),
      getDefaultLibFileName: ts.getDefaultLibFileName,
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      getDirectories: ts.sys.getDirectories,
      directoryExists: ts.sys.directoryExists
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
    if (fileName.match(libRegex)) {
      const typescriptLocation = require.resolve('typescript');
      const newFileName = path.resolve(path.dirname(typescriptLocation), fileName);
      this.logger.debug(`Resolving lib file ${fileName} to ${newFileName}`);
      return newFileName;
    } else {
      return fileName;
    }
  }
}