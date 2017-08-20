import { Config } from 'stryker-api/config';
import { Transpiler, FileStream, TranspilerOptions, FileLocation } from 'stryker-api/transpile';
import { filterOutTypescriptFiles, isTypescriptFile, getCompilerOptions, getProjectDirectory } from './helpers/tsHelpers';
import { streamToString } from './helpers/streamUtils';
import TranspilingLanguageService from './transpiler/TranspilingLanguageService';
import InMemoryFile from './transpiler/InMemoryFile';
const streamify = require('streamify-string');

export default class TypescriptTranspiler implements Transpiler {
  private languageService: TranspilingLanguageService;
  private readonly next: Transpiler;
  private readonly config: Config;
  private readonly keepSourceMaps: boolean;

  constructor(options: TranspilerOptions) {
    this.config = options.config;
    this.next = options.nextTranspiler;
    this.keepSourceMaps = options.keepSourceMaps;
  }

  transpile(files: FileStream[]): Promise<string | null> {
    const { typescriptFiles, otherFiles } = filterOutTypescriptFiles(files);
    return loadAll(typescriptFiles).then(
      files => {
        this.languageService = new TranspilingLanguageService(
          getCompilerOptions(this.config), files, getProjectDirectory(this.config), this.keepSourceMaps);
        const result = this.languageService.getAllSemanticDiagnostics();
        if (result.length) {
          return result;
        } else {
          const outputFiles = this.languageService.emitAll();
          return this.transpileNext(outputFiles, otherFiles);
        }
      }
    );
  }

  mutate(file: FileStream): Promise<string | null> {
    if (isTypescriptFile(file.name)) {
      return streamToString(file.content)
        .then(content => {
          this.languageService.replace(file.name, content);
          const error = this.languageService.getSemanticDiagnostics(file.name);
          const outputFile = this.languageService.emit(file.name);
          this.languageService.restore();
          if (error.length) {
            return error;
          } else {
            return this.mutateNext({
              name: outputFile.name,
              content: streamify(outputFile.content)
            });
          }
        });
    } else {
      return this.mutateNext(file);
    }
  }

  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    const outputLocation = this.languageService.getMappedLocationFor(sourceFileLocation);
    if (outputLocation) {
      return this.next.getMappedLocation(outputLocation);
    } else {
      throw new Error(`Could not find mapped location for ${sourceFileLocation.fileName}:${sourceFileLocation.start.line}:${sourceFileLocation.start.column}`);
    }
  }

  private transpileNext(inMemoryFiles: InMemoryFile[], otherFileStreams: FileStream[]) {
    return this.next.transpile(otherFileStreams.concat(inMemoryFiles.map(inMemoryFile => ({
      name: inMemoryFile.name,
      content: streamify(inMemoryFile.content)
    }))));
  }

  private mutateNext(file: FileStream): Promise<string | null> {
    return this.next.mutate(file);
  }
}

function loadAll(files: FileStream[]) {
  return Promise.all(files.map(
    file => streamToString(file.content).then(content => ({ name: file.name, content })))
  );
}