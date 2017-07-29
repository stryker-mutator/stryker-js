import * as ts from 'typescript';

export default class MemoryCompilerHost implements ts.CompilerHost {
  files: { [fileName: string]: string } = {}
  originalFiles: {[fileName: string] : string} = {}
  private compilationSettings: ts.CompilerOptions;
  constructor(settings: ts.CompilerOptions, private sourceFilePaths: string[]) { 
      this.compilationSettings = settings;
  }

  getSourceFile(filename: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
    var text = this.files[filename];
    if (!text) {
        if(this.fileExists(filename)){
            text = this.readFile(filename);
        }
    }
    if(!text) return null;
    return ts.createSourceFile(filename, text, languageVersion);
  }
  getCompilationSettings = () => this.compilationSettings;
  getDefaultLibFileLocation = () => ts.getDefaultLibFilePath(this.getCompilationSettings());
  getDefaultLibFileName = _ => "lib.d.ts";
  getDirectories = (path: string): string[] => [];
  writeFile = (filename: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void) => {}
  getCurrentDirectory = () => ts.sys.getCurrentDirectory();
  getCanonicalFileName (fileName: string) {
    return fileName;
  }
  useCaseSensitiveFileNames = () => true;
  getNewLine = () => "\n";
  fileExists =  (fileName: string) => {
      if(this.files[fileName]){
          return true; // contains file
      } else {
          return ts.sys.fileExists(fileName);
      }
  } 
  readFile = (fileName: string) => {
      if(this.files[fileName]){
          return this.files[fileName];
      } else {
          const file = ts.sys.readFile(fileName);
          if(file){
              this.addFile(fileName, file);
              if(!this.sourceFilePaths[fileName]){ // it's probably an import, we don't want to keep reading this from disk
                this.addFileToOriginalFiles(fileName, file);
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
            let result = ts.resolveModuleName(moduleName, containingFile, _.getCompilationSettings(), {fileExists: _.fileExists, readFile: _.readFile});
            if (result.resolvedModule) {
                if(result.resolvedModule.isExternalLibraryImport || !_.files[result.resolvedModule.resolvedFileName]){ // is external library, so it must be added to this.files
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
  addFileToOriginalFiles(fileName: string, body: string){
      this.originalFiles[fileName] = body;
  }
}