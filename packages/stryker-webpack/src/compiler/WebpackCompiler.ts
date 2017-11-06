import {FileKind, TextFile} from "stryker-api/core";
import FsWrapper, {FileSystem} from "../helpers/FsWrapper";
import {Compiler, Configuration} from "webpack";
import webpack from "./Webpack";
import * as path from "path";

export default class WebpackCompiler {
    private _compiler: Compiler;
    private _fsWrapper: FsWrapper;
    private _outPath: string;
    private _bundleFileName: string;

    public constructor(webpackConfig: Configuration, fs: FileSystem) {
        this._fsWrapper = new FsWrapper(fs);
        this._compiler = this.createCompiler(webpackConfig, fs);
        this._outPath = "/out";
        this._bundleFileName = "bundle.js";
    }

    private createCompiler(webpackConfig: Configuration, fileSystem: FileSystem): Compiler {
        // Declare as any here to avoid errors when setting filesystem
        const compiler: any = webpack(Object.assign({}, webpackConfig));

        // Setting filesystem to provided fs so compilation can be done in memory
        compiler.inputFileSystem = fileSystem;
        compiler.outputFileSystem = fileSystem;
        compiler.resolvers.normal.fileSystem = fileSystem;
        compiler.resolvers.context.fileSystem = fileSystem;

        return compiler as Compiler;
    }

    public async replace(files: Array<TextFile>): Promise<void> {
        for(let file of files) {
            await this.writeToFs(file);
        }
    }

    private async writeToFs(file: TextFile): Promise<void> {
        // Create the directory
        await this._fsWrapper.mkdirp(path.dirname(file.name));

        // Write the file to the filesystem
        await this._fsWrapper.writeFile(file.name, file.content);
    }

    public async emit(): Promise<Array<TextFile>> {
        await this.compile();

        const compileResult: string = await this._fsWrapper.readFile(path.join(this._outPath, this._bundleFileName));

        return new Array<TextFile>({
            content: compileResult,
            name: this._bundleFileName,
            mutated: true, // TODO: change this to the correct value
            kind: FileKind.Text,
            transpiled: true,
            included: true
        });
    }

    private compile(): Promise<webpack.Stats> {
        return new Promise<webpack.Stats>((resolve, reject) => {
            this._compiler.run((err, stats) => {
                if(err) {
                    reject(err);
                } else if(stats.hasErrors()) {
                    reject(Error(stats.toString("errors-only")));
                } else {
                    resolve(stats);
                }
            });
        });
    }
}