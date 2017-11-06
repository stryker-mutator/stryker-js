import {TranspilerOptions, Transpiler, TranspileResult, FileLocation} from "stryker-api/transpile";
import {File, TextFile} from "stryker-api/core";
import {Config} from "stryker-api/config"
import WebpackCompiler from "./compiler/WebpackCompiler";
import { FileSystem } from "./helpers/FsWrapper";

// TODO: Fix types for memory-fs
import MemoryFileSystem = require("memory-fs");

class WebpackTranspiler implements Transpiler {
    private _config: Config;
    private _compiler: WebpackCompiler;

    public constructor(options: TranspilerOptions) {
        this._config = options.config;
        const fs = new MemoryFileSystem() as FileSystem;

        this._compiler = new WebpackCompiler(this._config.webpackConfig, fs);
    }

    public async transpile(files: Array<File>): Promise<TranspileResult> {
        try {
            await this._compiler.replace(files as Array<TextFile>);

            const compileResult = await this._compiler.emit();

            return this.createSuccessResult(compileResult);
        } catch (err) {
            return this.createErrorResult(`${err.name}: ${err.message}`);
        }
    }

    private createErrorResult(error: string): TranspileResult {
        return {
            error: error,
            outputFiles: []
        };

    }

    private createSuccessResult(outPutFiles: File[]): TranspileResult {
        return {
            error: null,
            outputFiles: outPutFiles
        };
    }

    public getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
        // Waiting for a decision on how this is going to be implemented in the future
        // Return a "Method nog implemented" error for now.
        throw new Error("Method not implemented.");
    }
}

export default WebpackTranspiler;