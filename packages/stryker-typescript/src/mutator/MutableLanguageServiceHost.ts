import MutantCandidate from './MutantCandidate';
import * as fs from 'fs';
import * as ts from 'typescript';
import { Logger, getLogger } from 'log4js';

export default class MutableLanguageServiceHost implements ts.LanguageServiceHost {

  private readonly originalFiles: ts.MapLike<{ version: number, content: string }>;
  private currentMutatedFiles: ts.MapLike<string>;
  private logger: Logger;

  constructor(private compilerOptions: ts.CompilerOptions, private rootFiles: string[], private projectDirectory: string) {
    this.logger = getLogger(MutableLanguageServiceHost.name);
    this.originalFiles = Object.create(null);
    this.currentMutatedFiles = Object.create(null);
    this.getDefaultLibFileName = ts.getDefaultLibFileName;
    rootFiles.forEach(fileName => this.pullFileIntoMemory(fileName));
  }

  private pullFileIntoMemory(fileName: string, encoding: string = 'utf8') {
    if (fs.existsSync(fileName)) {
      this.logger.debug('Pulling file into memory: %s', fileName);
      this.originalFiles[fileName] = { version: 0, content: fs.readFileSync(fileName, 'utf8') };
    } else {
      this.logger.error(`File ${fileName} does not exist.`);
    }
  }

  /**
   * Mutates the in-memory source file in-memory
   * @param mutantCandidate The mutant used to replace the original source
   */
  mutate(mutantCandidate: MutantCandidate) {
    const fileName = mutantCandidate.sourceFile.fileName;
    const originalCode = this.originalFiles[fileName].content;
    this.currentMutatedFiles[fileName] =
      originalCode.slice(0, mutantCandidate.range[0]) + mutantCandidate.replacementSourceCode + originalCode.slice(mutantCandidate.range[1]);
    this.originalFiles[fileName].version++;
  }
  
  /**
   * Restores all mutated files (in-memory) to the original sources
   */
  restore() {
    const mutatedFiles = Object.keys(this.currentMutatedFiles);
    if (mutatedFiles.length > 0) {
      mutatedFiles.forEach(fileName => this.originalFiles[fileName].version++);
      this.currentMutatedFiles = Object.create(null);
    }
  }

  getScriptFileNames() {
    return this.rootFiles;
  }

  getScriptVersion(fileName: string) {
    if (!this.originalFiles[fileName]) {
      this.pullFileIntoMemory(fileName);
    }
    return this.originalFiles[fileName] && this.originalFiles[fileName].version.toString();
  }

  getScriptSnapshot(fileName: string) {
    const mutatedContent = this.currentMutatedFiles[fileName];
    if (mutatedContent) {
      return ts.ScriptSnapshot.fromString(mutatedContent);
    } else {
      if (!this.originalFiles[fileName]) {
        this.pullFileIntoMemory(fileName);
      }
      const file = this.originalFiles[fileName];
      if (file) {
        return ts.ScriptSnapshot.fromString(file.content);
      } else {
        return undefined;
      }
    }
  }

  getCurrentDirectory() {
    return this.projectDirectory;
  }
  getCompilationSettings() {
    return this.compilerOptions;
  }
  getDefaultLibFileName: (options: ts.CompilerOptions) => string;
}