import path from 'path';

import ts from 'typescript';
import { propertyPath, Task } from '@stryker-mutator/util';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';

import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { HybridFileSystem } from './fs/index.js';
import {
  determineBuildModeEnabled,
  guardTSVersion,
  overrideOptions,
  retrieveReferencedProjects,
  toBackSlashFileName,
  toPosixFileName,
} from './tsconfig-helpers.js';
import { Node } from './grouping/node.js';
import * as pluginTokens from './plugin-tokens.js';

export interface ITypescriptCompiler {
  init(): Promise<ts.Diagnostic[]>;
  check(mutants: Mutant[]): Promise<ts.Diagnostic[]>; // todo set return type
}

export interface IFileRelationCreator {
  getFileRelationsAsNodes(): void;
}

export type SourceFiles = Map<
  string,
  {
    fileName: string;
    imports: Set<string>;
  }
>;
const FILE_CHANGE_DETECTED_DIAGNOSTIC_CODE = 6032;

export class TypescriptCompiler implements ITypescriptCompiler, IFileRelationCreator {
  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.fs);

  private readonly allTSConfigFiles: Set<string>;
  private readonly tsconfigFile: string;
  private currentTask = new Task();
  private currentErrors: ts.Diagnostic[] = [];
  private readonly sourceFiles: SourceFiles = new Map();
  private readonly nodes = new Map<string, Node>();
  private lastMutants: Mutant[] = [];

  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly fs: HybridFileSystem) {
    this.tsconfigFile = toPosixFileName(this.options.tsconfigFile);
    this.allTSConfigFiles = new Set([path.resolve(this.tsconfigFile)]);
  }

  public async init(): Promise<ts.Diagnostic[]> {
    guardTSVersion();
    this.guardTSConfigFileExists();
    const buildModeEnabled = determineBuildModeEnabled(this.tsconfigFile);

    const host = ts.createSolutionBuilderWithWatchHost(
      {
        ...ts.sys,
        readFile: (fileName) => {
          if (this.fileNameIsBuildInfo(fileName)) {
            return undefined;
          }
          const content = this.fs.getFile(fileName)?.content;
          if (content && this.allTSConfigFiles.has(path.resolve(fileName))) {
            return this.adjustTSConfigFile(fileName, content, buildModeEnabled);
          }
          return content;
        },
        fileExists: (fileName: string) => {
          // We want to ignore the buildinfo files. With them the compiler skips the program part we want to use.
          if (this.fileNameIsBuildInfo(fileName)) {
            return false;
          }
          return ts.sys.fileExists(fileName);
        },
        getModifiedTime: (fileName: string) => {
          if (this.fileNameIsBuildInfo(fileName)) {
            return undefined;
          }
          return this.fs.getFile(fileName)?.modifiedTime;
        },
        watchFile: (fileName: string, callback: ts.FileWatcherCallback) => {
          const file = this.fs.getFile(fileName);

          if (file) file.watcher = callback;

          return {
            close: () => {
              delete this.fs.getFile(fileName)!.watcher;
            },
          };
        },
        writeFile: (fileName, data) => {
          this.fs.writeFile(fileName, data);
        },
        watchDirectory: (): ts.FileWatcher => {
          // this is used to see if new files are added to a directory. Can safely be ignored for mutation testing.
          return {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            close() {},
          };
        },
      },
      (...args) => {
        const program = ts.createEmitAndSemanticDiagnosticsBuilderProgram(...args);
        if (this.nodes.size) {
          return program;
        }
        program
          .getSourceFiles()
          .filter(filterDependency)
          .forEach((file) => {
            this.sourceFiles.set(file.fileName, {
              fileName: file.fileName,
              imports: new Set(
                program
                  .getAllDependencies(file)
                  .filter((importFile) => !importFile.includes('/node_modules/') && file.fileName !== importFile)
                  .flatMap((importFile) => this.resolveFilename(importFile))
              ),
            });
          });

        function filterDependency(file: ts.SourceFile) {
          if (file.fileName.includes('.d.ts')) return false;
          if (file.fileName.includes('node_modules')) return false;
          return true;
        }

        return program;
      },
      (error) => {
        this.currentErrors.push(error);
      },
      (status) => {
        this.log.debug(status.messageText.toString());
      },
      (summary) => {
        summary.code !== FILE_CHANGE_DETECTED_DIAGNOSTIC_CODE && this.currentTask.resolve();
      }
    );

    const compiler = ts.createSolutionBuilderWithWatch(host, [this.tsconfigFile], {});
    compiler.build();
    return await this.check([]);
  }

  public async check(mutants: Mutant[]): Promise<ts.Diagnostic[]> {
    this.lastMutants.forEach((mutant) => {
      const file = this.fs.getFile(mutant.fileName);
      file?.resetMutant();
    });
    mutants.forEach((mutant) => {
      const file = this.fs.getFile(mutant.fileName);
      file?.mutate(mutant);
    });
    await this.currentTask.promise;
    const errors = this.currentErrors;
    this.currentTask = new Task();
    this.currentErrors = [];
    this.lastMutants = mutants;
    return errors;
  }

  public getFileRelationsAsNodes(): Map<string, Node> {
    if (!this.nodes.size) {
      // create nodes
      for (const [fileName] of this.sourceFiles) {
        const backslashFileName = toBackSlashFileName(fileName);
        const node = new Node(backslashFileName, [], []);
        this.nodes.set(backslashFileName, node);
      }

      // set childs
      for (const [fileName, file] of this.sourceFiles) {
        const node = this.nodes.get(toBackSlashFileName(fileName));
        if (node == null) {
          throw new Error('todo');
        }

        const importFileNames = [...file.imports];
        // todo fix !
        node.children = importFileNames.map((importName) => this.nodes.get(toBackSlashFileName(importName))!).filter((n) => n != undefined);
      }

      for (const [, node] of this.nodes) {
        node.parents = [];
        for (const [_, n] of this.nodes) {
          if (n.children.includes(node)) {
            node.parents.push(n);
          }
        }
      }
    }

    return this.nodes;
  }

  private resolveFilename(fileName: string): string[] {
    if (!fileName.includes('.d.ts')) return [fileName];

    const file = this.fs.getFile(fileName);
    if (!file) throw new Error(`Could not find ${fileName}`);
    const sourceMappingURL = this.getSourceMappingURL(file.content);

    if (!sourceMappingURL) return [fileName];

    const sourceMapFileName = path.resolve(fileName, '..', sourceMappingURL);
    const sourceMap = this.fs.getFile(sourceMapFileName);
    if (!sourceMap) throw new Error(`Could not find ${sourceMapFileName}`);

    const content = JSON.parse(sourceMap.content);

    return content.sources.map((sourcePath: string) => toPosixFileName(path.resolve(sourceMapFileName, '..', sourcePath)));
  }

  private getSourceMappingURL(content: string): string | undefined {
    return /\/\/# sourceMappingURL=(.+)$/.exec(content)?.[1];
  }

  private adjustTSConfigFile(fileName: string, content: string, buildModeEnabled: boolean) {
    const parsedConfig = ts.parseConfigFileTextToJson(fileName, content);
    if (parsedConfig.error) {
      return content; // let the ts compiler deal with this error
    } else {
      for (const referencedProject of retrieveReferencedProjects(parsedConfig, path.dirname(fileName))) {
        this.allTSConfigFiles.add(referencedProject);
      }
      return overrideOptions(parsedConfig, buildModeEnabled);
    }
  }

  private guardTSConfigFileExists() {
    if (!ts.sys.fileExists(this.tsconfigFile)) {
      throw new Error(
        `The tsconfig file does not exist at: "${path.resolve(
          this.tsconfigFile
        )}". Please configure the tsconfig file in your stryker.conf file using "${propertyPath<StrykerOptions>()('tsconfigFile')}"`
      );
    }
  }

  private fileNameIsBuildInfo(fileName: string): boolean {
    return fileName.endsWith('.tsbuildinfo');
  }
}
