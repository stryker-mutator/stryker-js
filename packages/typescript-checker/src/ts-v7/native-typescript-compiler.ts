import fs from 'fs';
import path from 'path';

import type { API } from 'typescript7/unstable/sync';
import ts from 'typescript';
import { propertyPath } from '@stryker-mutator/util';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import {
  determineBuildModeEnabled,
  overrideOptions,
  retrieveReferencedProjects,
  toPosixFileName,
} from '../tsconfig-helpers.js';
import * as pluginTokens from '../plugin-tokens.js';

import { loadTypescript7 } from './load-typescript7.js';
import {
  diagnosticCategoryError,
  NativeDiagnostic,
  toNativeDiagnostic,
} from './native-diagnostic.js';
import { NativeFileSystem } from './native-file-system.js';
import { PositionConverter } from './position-converter.js';

/**
 * An in-memory type checker implementation that uses the (unstable) API of
 * the native TypeScript compiler preview (TypeScript 7, a.k.a. tsgo).
 *
 * Only "single project" mode is supported, project references (`--build` mode)
 * are not supported (yet) by the native compiler API.
 */
export class NativeTypescriptCompiler {
  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.fs,
  );

  private readonly tsconfigFile: string;
  private api: API | undefined;
  private lastMutants: Mutant[] = [];

  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly fs: NativeFileSystem,
  ) {
    this.tsconfigFile = toPosixFileName(
      path.resolve(this.options.tsconfigFile),
    );
  }

  /**
   * Starts the native TypeScript compiler and performs a dry run
   */
  public async init(): Promise<NativeDiagnostic[]> {
    this.guardTSConfigFileExists();
    this.guardNoProjectReferences();
    const { API } = await loadTypescript7();
    this.api = new API({
      fs: this.fs.tsFileSystem,
      cwd: process.cwd(),
    });
    await this.#adjustTSConfigFile();

    this.log.debug(
      'Started the native TypeScript compiler on project "%s"',
      this.tsconfigFile,
    );
    return this.checkSnapshot();
  }

  async #adjustTSConfigFile(fileName = this.options.tsconfigFile) {
    const parsedConfig = ts.parseConfigFileTextToJson(
      fileName,
      await fs.promises.readFile(fileName, 'utf-8'),
    );
    if (parsedConfig.error) {
      return; // let the ts compiler deal with this error
    } else {
      for (const referencedProject of retrieveReferencedProjects(
        parsedConfig,
        path.dirname(fileName),
      )) {
        await this.#adjustTSConfigFile(referencedProject);
      }
      const options = overrideOptions(parsedConfig, /*buildMode*/ false);
      await this.fs.markProjectFile(fileName, options);
    }
  }

  /**
   * Type checks the project with the provided mutants applied (and previous mutants reverted)
   * @param mutants The mutants to apply before type checking
   */
  public async check(mutants: Mutant[]): Promise<NativeDiagnostic[]> {
    const changedFiles = new Set(
      [...this.lastMutants, ...mutants].map((mutant) =>
        toPosixFileName(path.resolve(mutant.fileName)),
      ),
    );
    this.lastMutants.forEach((mutant) =>
      this.fs.restore(path.resolve(mutant.fileName)),
    );
    mutants.forEach((mutant) =>
      this.fs.mutate({ ...mutant, fileName: path.resolve(mutant.fileName) }),
    );
    this.lastMutants = mutants;
    return Promise.resolve(this.checkSnapshot([...changedFiles]));
  }

  /**
   * Determines whether or not the given file is part of the opened typescript project
   */
  public isProjectFile(fileName: string): boolean {
    return this.fs.projectFiles.has(toPosixFileName(path.resolve(fileName)));
  }

  public dispose(): void {
    this.api?.close();
  }

  private async checkSnapshot(
    changedFiles?: string[],
  ): Promise<NativeDiagnostic[]> {
    const snapshot = this.api!.updateSnapshot({
      openProject: this.tsconfigFile,
      fileChanges: changedFiles && { changed: changedFiles },
    });
    try {
      const diagnostics: NativeDiagnostic[] = [];
      for (const project of snapshot.getProjects()) {
        await Promise.all(
          project.rootFiles.map((rootFile) =>
            this.fs.markProjectFile(rootFile),
          ),
        );
        diagnostics.push(
          ...[
            ...project.program.getConfigFileParsingDiagnostics(),
            ...project.program.getSyntacticDiagnostics(),
            ...project.program.getSemanticDiagnostics(),
          ]
            .filter(
              (diagnostic) => diagnostic.category === diagnosticCategoryError,
            )
            .map((diagnostic) =>
              toNativeDiagnostic(
                diagnostic,
                this.fs.getPositionConverter(diagnostic.fileName),
              ),
            ),
        );
      }
      return diagnostics;
    } finally {
      snapshot.dispose();
    }
  }

  private guardTSConfigFileExists() {
    if (!fs.existsSync(this.tsconfigFile)) {
      throw new Error(
        `The tsconfig file does not exist at: "${path.resolve(
          this.tsconfigFile,
        )}". Please configure the tsconfig file in your stryker.conf file using "${propertyPath<StrykerOptions>()('tsconfigFile')}"`,
      );
    }
  }

  private guardNoProjectReferences() {
    if (determineBuildModeEnabled(this.tsconfigFile)) {
      throw new Error(
        `Project references (in "${this.tsconfigFile}") are not (yet) supported in combination with "typescriptChecker": { "experimentalNativePreview": true }. Please configure a tsconfig file without "references", or disable the native preview.`,
      );
    }
  }
}
