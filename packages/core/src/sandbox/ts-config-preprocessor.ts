import path from 'path';

import { StrykerOptions, File } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import { FilePreprocessor } from './file-preprocessor';

export interface TSConfig {
  references?: Array<{ path: string }>;
  extends?: string;
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
  private readonly touched: string[] = [];
  private readonly fs = new Map<string, File>();
  public static readonly inject = tokens(commonTokens.logger, commonTokens.options);
  constructor(private readonly log: Logger, private readonly options: StrykerOptions) {}

  public async preprocess(input: File[]): Promise<File[]> {
    if (this.options.inPlace) {
      // If stryker is running 'inPlace', we don't have to change the tsconfig file
      return input;
    } else {
      const tsconfigFile = path.resolve(this.options.tsconfigFile);
      if (input.find((file) => file.name === tsconfigFile)) {
        this.fs.clear();
        input.forEach((file) => {
          this.fs.set(file.name, file);
        });
        await this.rewriteTSConfigFile(tsconfigFile);
        return [...this.fs.values()];
      } else {
        return input;
      }
    }
  }

  private async rewriteTSConfigFile(tsconfigFileName: string): Promise<void> {
    if (!this.touched.includes(tsconfigFileName)) {
      this.touched.push(tsconfigFileName);
      const tsconfigFile = this.fs.get(tsconfigFileName);
      if (tsconfigFile) {
        this.log.debug('Rewriting file %s', tsconfigFile);
        const ts = await import('typescript');
        const { config }: { config?: TSConfig } = ts.parseConfigFileTextToJson(tsconfigFile.name, tsconfigFile.textContent);
        if (config) {
          await this.rewriteExtends(config, tsconfigFileName);
          await this.rewriteProjectReferences(config, tsconfigFileName);
          this.rewriteFileArrayProperty(config, tsconfigFileName, 'include');
          this.rewriteFileArrayProperty(config, tsconfigFileName, 'exclude');
          this.rewriteFileArrayProperty(config, tsconfigFileName, 'files');
          this.fs.set(tsconfigFileName, new File(tsconfigFileName, JSON.stringify(config, null, 2)));
        }
      }
    }
  }

  private async rewriteExtends(config: TSConfig, tsconfigFileName: string): Promise<void> {
    const extend = config.extends;
    if (typeof extend === 'string') {
      const rewritten = this.tryRewriteReference(extend, tsconfigFileName);
      if (rewritten) {
        config.extends = rewritten;
      } else {
        await this.rewriteTSConfigFile(path.resolve(path.dirname(tsconfigFileName), extend));
      }
    }
  }

  private rewriteFileArrayProperty(config: TSConfig, tsconfigFileName: string, prop: 'exclude' | 'files' | 'include'): void {
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

  private async rewriteProjectReferences(config: TSConfig, originTSConfigFileName: string): Promise<void> {
    const ts = await import('typescript');
    if (Array.isArray(config.references)) {
      for (const reference of config.references) {
        const referencePath = ts.resolveProjectReferencePath(reference);
        const rewritten = this.tryRewriteReference(referencePath, originTSConfigFileName);
        if (rewritten) {
          reference.path = rewritten;
        } else {
          await this.rewriteTSConfigFile(path.resolve(path.dirname(originTSConfigFileName), referencePath));
        }
      }
    }
  }

  private tryRewriteReference(reference: string, originTSConfigFileName: string): string | false {
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
