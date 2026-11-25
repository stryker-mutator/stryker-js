import path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import { Project } from '../fs/project.js';
import { coreTokens } from '../di/index.js';
import type { TemporaryDirectory } from '../utils/temporary-directory.js';

import { FilePreprocessor } from './file-preprocessor.js';

export interface TSConfig {
  references?: Array<{ path: string }>;
  extends?: string | string[];
  files?: string[];
  exclude?: string[];
  include?: string[];
  compilerOptions?: Record<string, unknown>;
}
/**
 * A helper class that rewrites `references` and `extends` file paths if they end up falling outside of the sandbox.
 * @example
 * {
 *   "extends": "../../tsconfig.settings.json",
 *   "references": {
 *      "path": "../model"
 *   }
 * }
 * becomes:
 * {
 *   "extends": "../../../../tsconfig.settings.json",
 *   "references": {
 *      "path": "../../../model"
 *   }
 * }
 */
export class TSConfigPreprocessor implements FilePreprocessor {
  private readonly touched = new Set<string>();
  public static readonly inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    coreTokens.temporaryDirectory,
  );
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly sandboxDirectory: Pick<TemporaryDirectory, 'path'>,
  ) {}

  public async preprocess(project: Project): Promise<void> {
    if (this.options.inPlace) {
      // If stryker is running 'inPlace', we don't have to change the tsconfig file
      return;
    } else {
      this.touched.clear();
      await this.rewriteTSConfigFile(
        project,
        path.resolve(this.options.tsconfigFile),
      );
    }
  }

  private async rewriteTSConfigFile(
    project: Project,
    tsconfigFileName: string,
  ): Promise<void> {
    if (!this.touched.has(tsconfigFileName)) {
      this.touched.add(tsconfigFileName);
      const tsconfigFile = project.files.get(tsconfigFileName);
      if (tsconfigFile) {
        this.log.debug('Rewriting file %s', tsconfigFile);
        const { default: ts } = await import('typescript');
        const { config }: { config?: TSConfig } = ts.parseConfigFileTextToJson(
          tsconfigFileName,
          await tsconfigFile.readContent(),
        );
        if (config) {
          await this.rewriteExtends(project, config, tsconfigFileName);
          await this.rewriteProjectReferences(
            project,
            config,
            tsconfigFileName,
          );
          this.rewriteFileArrayProperty(config, tsconfigFileName, 'include');
          this.rewriteFileArrayProperty(config, tsconfigFileName, 'exclude');
          this.rewriteFileArrayProperty(config, tsconfigFileName, 'files');
          tsconfigFile.setContent(JSON.stringify(config, null, 2));
        }
      }
    }
  }

  private async rewriteExtends(
    project: Project,
    config: TSConfig,
    tsconfigFileName: string,
  ): Promise<void> {
    const rewrite = async (reference: string): Promise<string> => {
      if (typeof reference !== 'string') return reference;
      const rewritten = this.tryRewriteReference(reference, tsconfigFileName);
      if (rewritten !== false) return rewritten;
      await this.rewriteTSConfigFile(
        project,
        path.resolve(path.dirname(tsconfigFileName), reference),
      );
      return reference;
    };
    if (typeof config.extends === 'string') {
      config.extends = await rewrite(config.extends);
    } else if (Array.isArray(config.extends)) {
      for (const [index, reference] of config.extends.entries()) {
        config.extends[index] = await rewrite(reference);
      }
    }
  }

  private rewriteFileArrayProperty(
    config: TSConfig,
    tsconfigFileName: string,
    prop: 'exclude' | 'files' | 'include',
  ): void {
    const fileArray = config[prop];
    if (Array.isArray(fileArray)) {
      config[prop] = fileArray.map((pattern) => {
        const rewritten = this.tryRewriteReference(pattern, tsconfigFileName);
        if (rewritten) {
          return rewritten;
        } else {
          return pattern;
        }
      });
    }
  }

  private async rewriteProjectReferences(
    project: Project,
    config: TSConfig,
    originTSConfigFileName: string,
  ): Promise<void> {
    const { default: ts } = await import('typescript');
    if (Array.isArray(config.references)) {
      for (const reference of config.references) {
        const referencePath = ts.resolveProjectReferencePath(reference);
        const rewritten = this.tryRewriteReference(
          referencePath,
          originTSConfigFileName,
        );
        if (rewritten) {
          reference.path = rewritten;
        } else {
          await this.rewriteTSConfigFile(
            project,
            path.resolve(path.dirname(originTSConfigFileName), referencePath),
          );
        }
      }
    }
  }

  private tryRewriteReference(
    reference: string,
    originTSConfigFileName: string,
  ): string | false {
    const dirName = path.dirname(originTSConfigFileName);
    const fileName = path.resolve(dirName, reference);
    const projectRoot = process.cwd();
    const relativeToProject = path.relative(projectRoot, fileName);
    if (
      relativeToProject === '..' ||
      relativeToProject.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativeToProject)
    ) {
      const relocatedConfigDir = path.resolve(
        this.sandboxDirectory.path,
        path.relative(projectRoot, dirName),
      );
      const relative = path.relative(relocatedConfigDir, fileName);
      const portable = relative.split(path.sep).join('/');
      return path.isAbsolute(relative) ||
        portable.startsWith('../') ||
        portable === '..'
        ? portable
        : `./${portable}`;
    }
    return false;
  }
}
