import { Transpiler, TranspilerOptions, TranspileResult, FileLocation } from 'stryker-api/transpile';
import { File, TextFile, FileKind } from 'stryker-api/core';
import * as babel from 'babel-core';
import * as path from 'path';
import { CONFIG_KEY_FILE } from './helpers/keys';

class BabelTranspiler implements Transpiler {
  private _babelConfig: babel.GeneratorOptions;
  private _knownExtensions: Array<string>;

  public constructor(options: TranspilerOptions) {
    this._babelConfig = options.config[CONFIG_KEY_FILE];
    this._knownExtensions = ['.js', '.jsx', '.ts'];
  }

  public transpile(files: Array<File>): Promise<TranspileResult> {
    const results: Array<File> = [];
    const errorResults: Array<string> = [];

    files.forEach((file) => {
      if (file.kind === FileKind.Text) {
        let content: string = file.content;

        if (this.shouldBeTranspiled(file)) {
          try {
            content = this.transform(file.content);
          } catch (err) {
            errorResults.push(`${file.name}: ${err.message}`);
          }
        }

        results.push(this.createTextFile(file.name, content, file.mutated, file.included, file.transpiled));
      }
    });

    return Promise.resolve(this.createResult(results, errorResults));
  }

  private shouldBeTranspiled(file: File) {
    return this._knownExtensions.indexOf(`${path.extname(file.name)}`) !== -1 && file.transpiled;
  }

  private transform(content: string) {
    const result = babel.transform(content, this._babelConfig).code;

    if (!result) {
      throw new Error('Could not transpile file with the Babel transform function');
    }

    return result;
  }

  private createTextFile(name: string, content: string, mutated: boolean, included: boolean, transpiled: boolean): TextFile {
    return {
      name: name,
      content: content,
      mutated: mutated,
      included: included,
      transpiled: transpiled,
      kind: FileKind.Text
    };
  }

  private createResult(results: Array<File>, errorResults: Array<string>): TranspileResult {
    if (errorResults.length > 0) {
      return this.createErrorResult(errorResults.join('\n\r'));
    }

    return this.createSuccessResult(results);
  }

  private createErrorResult(error: string): TranspileResult {
    return {
      error: error,
      outputFiles: []
    };
  }

  private createSuccessResult(files: Array<File>): TranspileResult {
    return {
      error: null,
      outputFiles: files
    };
  }

  public getMappedLocation(): FileLocation {
    throw new Error('Not implemented');
  }
}

export default BabelTranspiler;