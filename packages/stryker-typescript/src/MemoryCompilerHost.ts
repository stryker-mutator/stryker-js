import * as path from 'path';
import * as ts from 'typescript';

export default class MemoryCompilerHost implements ts.CompilerHost {
  files: { [fileName: string]: string } = {}
  originalFiles: { [fileName: string]: string } = {}
  private compilationSettings: ts.CompilerOptions;
  constructor(settings: ts.CompilerOptions, private sourceFilePaths: string[]) {
    this.compilationSettings = settings;
  }

  getSourceFile(filename: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
    const normalizedFilename = path.normalize(filename);
    var text = this.files[normalizedFilename];
    if (!text) {
      if (this.fileExists(normalizedFilename)) {

        text = this.readFile(normalizedFilename);
      }
    }
    if (!text) return null;
    return ts.createSourceFile(normalizedFilename, text, languageVersion);
  }
  getCompilationSettings = () => this.compilationSettings;
  getDefaultLibFileLocation = () => ts.getDefaultLibFilePath(this.getCompilationSettings());
  getDefaultLibFileName = _ => "lib.d.ts";
  getDirectories = (path: string): string[] => [];
  writeFile = (filename: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void) => { }
  getCurrentDirectory = () => ts.sys.getCurrentDirectory();
  getCanonicalFileName(fileName: string) {
    return fileName;
  }
  useCaseSensitiveFileNames = () => true;
  getNewLine = () => "\n";
  fileExists = (fileName: string) => {
    const normalizedFilename = path.normalize(fileName);
    if (this.files[normalizedFilename]) {
      return true; // contains file
    } else {
      return ts.sys.fileExists(normalizedFilename);
    }
  }
  readFile = (fileName: string) => {
    const normalizedFilename = path.normalize(fileName);
    if (this.files[normalizedFilename]) {
      return this.files[normalizedFilename];
    } else {
      console.log("readfile reading file " + fileName);
      const file = ts.sys.readFile(normalizedFilename);
      if (file) {
        this.addFile(normalizedFilename, file);
        if (!this.sourceFilePaths[normalizedFilename]) { // it's probably an import, we don't want to keep reading this from disk
          this.addFileToOriginalFiles(normalizedFilename, file);
        }
      }
      return file;
    }
  }

  resolveModuleNames(moduleNames, containingFile) {
    if (moduleNames.indexOf("global") >= 0)
      throw new Error("Module 'global' does not exist!!");
    let _: MemoryCompilerHost = this;
    return moduleNames.map(moduleName => {
      let result = ts.resolveModuleName(moduleName, containingFile, _.getCompilationSettings(), { fileExists: _.fileExists, readFile: _.readFile });
      if (result.resolvedModule) {
        if (result.resolvedModule.isExternalLibraryImport || !_.files[result.resolvedModule.resolvedFileName]) { // is external library, so it must be added to this.files
          let file = _.readFile(result.resolvedModule.resolvedFileName);
          _.addFile(result.resolvedModule.resolvedFileName, file.toString());
          _.addFileToOriginalFiles(result.resolvedModule.resolvedFileName, file.toString());
        }
        return result.resolvedModule;
      }
      return undefined;
    });
  }

  resetToOriginalFiles() {
    this.sourceFilePaths.forEach(filePath => {
      this.files[filePath] = this.originalFiles[filePath];
    });
  }
  addFile(fileName: string, body: string) {
    this.files[fileName] = body;
  }
  addFileToOriginalFiles(fileName: string, body: string) {
    this.originalFiles[fileName] = body;
  }
}