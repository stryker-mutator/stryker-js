import path from 'path';

import { parse, type ParseError } from 'jsonc-parser';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import { Project } from '../fs/project.js';

import { FilePreprocessor } from './file-preprocessor.js';

export interface TSConfig {
  references?: Array<{ path: string }>;
  extends?: string;
  files?: string[];
  exclude?: string[];
  include?: string[];
  compilerOptions?: Record<string, unknown>;
}

/**
 * Parses the content of a tsconfig file, a jsonc file (json with comments and trailing commas).
 * We don't use the TypeScript api for this, because TypeScript 7 no longer ships the compiler api,
 * see https://github.com/stryker-mutator/stryker-js/issues/6111.
 * @returns the parsed config or `undefined` when the content could not be parsed
 */
export function parseTSConfig(content: string): TSConfig | undefined {
  const parseErrors: ParseError[] = [];
  // TypeScript ignores a byte order mark, but `jsonc-parser` does not
  const text = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
  const config = parse(text, parseErrors, {
    allowTrailingComma: true,
  }) as TSConfig;
  if (parseErrors.length) {
    // Invalid jsonc, let the typescript compiler deal with the error
    return undefined;
  }
  return config;
}

/**
 * Resolves a project reference to the tsconfig file it points to, i.e. `../model` becomes `../model/tsconfig.json`.
 * Implements `ts.resolveProjectReferencePath`, which TypeScript 7 no longer ships,
 * see https://github.com/stryker-mutator/stryker-js/issues/6111.
 */
export function resolveProjectReferencePath(reference: {
  path: string;
}): string {
  const project = reference.path.replace(/\\/g, '/');
  return project.endsWith('.json')
    ? project
    : `${project.replace(/\/+$/, '')}/tsconfig.json`;
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
  );
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
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
        const config = parseTSConfig(await tsconfigFile.readContent());
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
    const extend = config.extends;
    if (typeof extend === 'string') {
      const rewritten = this.tryRewriteReference(extend, tsconfigFileName);
      if (rewritten) {
        config.extends = rewritten;
      } else {
        await this.rewriteTSConfigFile(
          project,
          path.resolve(path.dirname(tsconfigFileName), extend),
        );
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
    if (Array.isArray(config.references)) {
      for (const reference of config.references) {
        const referencePath = resolveProjectReferencePath(reference);
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
    const relativeToSandbox = path.relative(process.cwd(), fileName);
    if (relativeToSandbox.startsWith('..')) {
      return this.join('..', '..', reference);
    }
    return false;
  }

  private join(...pathSegments: string[]) {
    return pathSegments.map((segment) => segment.replace(/\\/g, '/')).join('/');
  }
}
