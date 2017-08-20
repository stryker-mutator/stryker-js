import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { Logger, getLogger } from 'log4js';
import flatMap = require('lodash.flatmap');
import { FileLocation } from 'stryker-api/transpile';
import InMemoryFile from './InMemoryFile';
import ScriptFile from './ScriptFile';
import OutputFile from './OutputFile';


export default class TranspilingLanguageService {
  private languageService: ts.LanguageService;

  private compilerOptions: ts.CompilerOptions;
  private readonly files: ts.MapLike<ScriptFile>;
  private readonly outputFiles: ts.MapLike<OutputFile>;
  private replacedFiles: string[];
  private logger: Logger;
  private readonly diagnosticsFormatter: ts.FormatDiagnosticsHost;

  constructor(compilerOptions: Readonly<ts.CompilerOptions>, private rootFiles: InMemoryFile[], private projectDirectory: string, private keepSourceMaps: boolean) {
    this.logger = getLogger(TranspilingLanguageService.name);
    this.files = Object.create(null);
    this.outputFiles = Object.create(null);
    this.replacedFiles = [];
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
   * Temporarily mutate the in-memory source file in-memory
   * @param mutantCandidate The mutant used to replace the original source
   */
  replace(fileName: string, content: string) {
    this.replacedFiles.push(fileName);
    this.files[fileName].replace(content);
  }

  /**
   * Restores all mutated files (in-memory) to the original sources
   */
  restore() {
    this.replacedFiles.forEach(replacedFile => this.files[replacedFile].restore());
    this.replacedFiles = [];
  }

  getAllSemanticDiagnostics() {
    const errors = flatMap(this.rootFiles, file => this.languageService.getSemanticDiagnostics(file.name));
    return ts.formatDiagnostics(errors, this.diagnosticsFormatter);
  }

  getSemanticDiagnostics(fileName: string) {
    const errors = this.languageService.getSemanticDiagnostics(fileName);
    return ts.formatDiagnostics(errors, this.diagnosticsFormatter);
  }

  emitAll(): InMemoryFile[] {
    if (this.compilerOptions.outFile) {
      // If it is a single out file, just transpile one file as it is all bundled together anyway.
      return [this.emit(this.rootFiles[0].name)];
    } else {
      return this.rootFiles.map(file => this.emit(file.name));
    }
  }

  emit(fileName: string): InMemoryFile {
    const outputFiles = this.languageService.getEmitOutput(fileName).outputFiles;
    const mapFile = outputFiles.find(file => file.name.endsWith('.js.map'));
    const jsFile = outputFiles.find(file => file.name.endsWith('.js'));
    if (jsFile) {
      const outputFile = new OutputFile(jsFile.name, jsFile.text, mapFile ? mapFile.text : '');
      if (this.compilerOptions.outFile) {
        // All output is bundled together. Configure this output file for all root files.
        this.rootFiles.forEach(rootFile => this.outputFiles[rootFile.name] = outputFile);
      } else {
        this.outputFiles[fileName] = outputFile;
      }
      return {
        name: jsFile.name,
        content: jsFile.text
      };
    } else {
      throw new Error(`Emit error! Could not emit file ${fileName}`);
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
      getCurrentDirectory: () => this.projectDirectory,
      getDefaultLibFileName: (compilerSettings) => {
        const typescriptLocation = require.resolve('typescript');
        return path.resolve(path.dirname(typescriptLocation), ts.getDefaultLibFileName(compilerSettings));
      },
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory
    };
  }

  private pullFileIntoMemoryIfNeeded(fileName: string) {
    if (!this.files[fileName]) {
      if (fs.existsSync(fileName)) {
        this.logger.debug('Pulling file into memory: %s', fileName);
        this.files[fileName] = new ScriptFile(fileName, fs.readFileSync(fileName, 'utf8'));
      } else {
        this.logger.error(`File ${fileName} does not exist.`);
      }
    }
  }
}