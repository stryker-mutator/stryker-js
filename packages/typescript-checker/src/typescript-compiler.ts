import path from 'path';

import ts from 'typescript';
import { propertyPath, Task } from '@stryker-mutator/util';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { HybridFileSystem } from './fs/index.js';
import {
  determineBuildModeEnabled,
  getSourceMappingURL,
  guardTSVersion,
  overrideOptions,
  retrieveReferencedProjects,
  toPosixFileName,
} from './tsconfig-helpers.js';
import { TSFileNode } from './grouping/ts-file-node.js';
import * as pluginTokens from './plugin-tokens.js';

export interface ITypescriptCompiler {
  init(): Promise<ts.Diagnostic[]>;
  check(mutants: Mutant[]): Promise<ts.Diagnostic[]>;
}

export interface IFileRelationCreator {
  get nodes(): Map<string, TSFileNode>;
}

export type SourceFiles = Map<
  string,
  {
    fileName: string;
    imports: Set<string>;
  }
>;
const FILE_CHANGE_DETECTED_DIAGNOSTIC_CODE = 6032;

export class TypescriptCompiler
  implements ITypescriptCompiler, IFileRelationCreator
{
  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.fs,
  );

  private readonly allTSConfigFiles: Set<string>;
  private readonly tsconfigFile: string;
  private currentTask = new Task();
  private currentErrors: ts.Diagnostic[] = [];
  private readonly sourceFiles: SourceFiles = new Map();
  private readonly _nodes = new Map<string, TSFileNode>();
  private lastMutants: Mutant[] = [];

  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly fs: HybridFileSystem,
  ) {
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

          if (file) {
            file.watcher = callback;
          }

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
            close() {},
          };
        },
      },
      (...args) => {
        const program = ts.createEmitAndSemanticDiagnosticsBuilderProgram(
          ...args,
        );
        if (this._nodes.size) {
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
                  .filter(
                    (importFile) =>
                      !importFile.includes('/node_modules/') &&
                      file.fileName !== importFile,
                  )
                  .flatMap((importFile) => this.resolveTSInputFile(importFile)),
              ),
            });
          });

        function filterDependency(file: ts.SourceFile) {
          if (
            file.fileName.endsWith('.d.ts') ||
            file.fileName.includes('node_modules')
          ) {
            return false;
          }

          return true;
        }

        return program;
      },
      (error) => {
        this.currentErrors.push(error);
      },
      (status) => {
        // TODO: Remove this eslint warning
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        this.log.debug(status.messageText.toString());
      },
      (summary) => {
        if (summary.code !== FILE_CHANGE_DETECTED_DIAGNOSTIC_CODE) {
          this.currentTask.resolve();
        }
      },
    );

    const compiler = ts.createSolutionBuilderWithWatch(
      host,
      [this.tsconfigFile],
      {},
    );
    compiler.build();
    return await this.check([]);
  }

  public async check(mutants: Mutant[]): Promise<ts.Diagnostic[]> {
    this.lastMutants.forEach((mutant) => {
      const file = this.fs.getFile(mutant.fileName);
      file!.resetMutant();
    });
    mutants.forEach((mutant) => {
      const file = this.fs.getFile(mutant.fileName);
      file!.mutate(mutant);
    });
    await this.currentTask.promise;
    const errors = this.currentErrors;
    this.currentTask = new Task();
    this.currentErrors = [];
    this.lastMutants = mutants;
    return errors;
  }

  public get nodes(): Map<string, TSFileNode> {
    if (!this._nodes.size) {
      // create nodes
      for (const [fileName] of this.sourceFiles) {
        const node = new TSFileNode(fileName, [], []);
        this._nodes.set(fileName, node);
      }

      // set children
      for (const [fileName, file] of this.sourceFiles) {
        const node = this._nodes.get(fileName);
        if (node == null) {
          throw new Error(
            `Node for file '${fileName}' could not be found. This should not happen. This shouldn't happen, please open an issue on the stryker-js github`,
          );
        }

        const importFileNames = [...file.imports];
        node.children = importFileNames
          .map((importName) => this._nodes.get(importName)!)
          .filter((n) => n != undefined);
      }

      // set parents
      for (const [, node] of this._nodes) {
        node.parents = [];
        for (const [, n] of this._nodes) {
          if (n.children.includes(node)) {
            node.parents.push(n);
          }
        }
      }
    }

    return this._nodes;
  }

  /**
   * Resolves TS input file based on a dependency of a input file
   * @param dependencyFileName The dependency file name. With TS project references this can be a declaration file
   * @returns TS source file if found (fallbacks to input filename)
   */
  private resolveTSInputFile(dependencyFileName: string): string {
    if (!dependencyFileName.endsWith('.d.ts')) {
      return dependencyFileName;
    }

    const file = this.fs.getFile(dependencyFileName);
    if (!file) {
      throw new Error(`Could not find ${dependencyFileName}`);
    }

    const sourceMappingURL = getSourceMappingURL(file.content);
    if (!sourceMappingURL) {
      return dependencyFileName;
    }

    const sourceMapFileName = path.resolve(
      path.dirname(dependencyFileName),
      sourceMappingURL,
    );
    const sourceMap = this.fs.getFile(sourceMapFileName);
    if (!sourceMap) {
      this.log.warn(`Could not find sourcemap ${sourceMapFileName}`);
      return dependencyFileName;
    }

    const sources: string[] | undefined = JSON.parse(sourceMap.content).sources;

    if (sources?.length === 1) {
      const [sourcePath] = sources;
      return toPosixFileName(
        path.resolve(path.dirname(sourceMapFileName), sourcePath),
      );
    }

    return dependencyFileName;
  }

  private adjustTSConfigFile(
    fileName: string,
    content: string,
    buildModeEnabled: boolean,
  ) {
    const parsedConfig = ts.parseConfigFileTextToJson(fileName, content);
    if (parsedConfig.error) {
      return content; // let the ts compiler deal with this error
    } else {
      for (const referencedProject of retrieveReferencedProjects(
        parsedConfig,
        path.dirname(fileName),
      )) {
        this.allTSConfigFiles.add(referencedProject);
      }
      return overrideOptions(parsedConfig, buildModeEnabled);
    }
  }

  private guardTSConfigFileExists() {
    if (!ts.sys.fileExists(this.tsconfigFile)) {
      throw new Error(
        `The tsconfig file does not exist at: "${path.resolve(
          this.tsconfigFile,
        )}". Please configure the tsconfig file in your stryker.conf file using "${propertyPath<StrykerOptions>()('tsconfigFile')}"`,
      );
    }
  }

  private fileNameIsBuildInfo(fileName: string): boolean {
    return fileName.endsWith('.tsbuildinfo');
  }
}
