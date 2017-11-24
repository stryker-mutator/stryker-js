import { Transpiler, TranspilerOptions, TranspileResult, FileLocation } from 'stryker-api/transpile';
import { File, TextFile, FileKind } from 'stryker-api/core';
import * as babel from 'babel-core';

class BabelTranspiler implements Transpiler {
    private _babelConfig: babel.GeneratorOptions;

    public constructor(options: TranspilerOptions) {
        this._babelConfig = options.config.babelConfig;
    }
    
    public transpile(files: Array<File>): Promise<TranspileResult> {
        const results: Array<File> = [];
        
        try {
            files.forEach((file) => {
                if (file.kind === FileKind.Text) {
                    results.push(this.transform(file));
                }
                else {
                    results.push(file);
                }
            });            
        } catch (err) {
            return Promise.resolve(this.createErrorResult(err));
        }

        return Promise.resolve(this.createSuccessResult(results));
    }

    private transform(file: TextFile) {
        const result = babel.transform(file.content, this._babelConfig).code;
        
        if (!result) {
            throw new Error('Could not transplile file with the Babel transform function');
        }

        file.content = result;

        return file;
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