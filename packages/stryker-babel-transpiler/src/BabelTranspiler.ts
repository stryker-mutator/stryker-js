import { Transpiler, TranspilerOptions, TranspileResult, FileLocation } from 'stryker-api/transpile';
import { File, TextFile, FileKind } from 'stryker-api/core';
import * as babel from 'babel-core';
import * as path from 'path';
import { EOL } from 'os';
import BabelConfigReader from './BabelConfigReader';

class BabelTranspiler implements Transpiler {
  private babelConfig: babel.TransformOptions;
  private knownExtensions: string[];

  public constructor(options: TranspilerOptions) {
    this.babelConfig = new BabelConfigReader().readConfig(options.config);

    this.knownExtensions = ['.js', '.jsx'];
  }

  public transpile(files: File[]): Promise<TranspileResult> {
    const outputFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (this.shouldBeTranspiled(file)) {
        try {
          outputFiles.push({
            name: file.name,
            content: this.transform((file as TextFile).content),
            mutated: file.mutated,
            included: file.included,
            transpiled: file.transpiled,
            kind: FileKind.Text
          });
        } catch (err) {
          errors.push(`${file.name}: ${err.message}`);
        }
      } else {
        outputFiles.push(file);
      }
    });

    return Promise.resolve(this.createResult(outputFiles, errors));
  }

  private shouldBeTranspiled(file: File) {
    return file.kind === FileKind.Text
      && file.transpiled
      && this.knownExtensions.indexOf(path.extname(file.name)) >= 0;
  }

  private transform(code: string) {
    const result = babel.transform(code, this.babelConfig).code;

    if (!result) {
      throw new Error('Could not transpile file with the Babel transform function');
    }

    return result;
  }

  private createResult(results: File[], errorResults: string[]): TranspileResult {
    if (errorResults.length > 0) {
      return this.createErrorResult(errorResults.join(EOL));
    }

    return this.createSuccessResult(results);
  }

  private createErrorResult(error: string): TranspileResult {
    return {
      error,
      outputFiles: []
    };
  }

  private createSuccessResult(outputFiles: File[]): TranspileResult {
    return {
      error: null,
      outputFiles
    };
  }

  public getMappedLocation(): FileLocation {
    throw new Error('Not implemented');
  }
}

export default BabelTranspiler;