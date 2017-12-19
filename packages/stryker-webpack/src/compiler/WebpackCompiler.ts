import { FileKind, TextFile } from "stryker-api/core";
import FsWrapper from '../helpers/FsWrapper';
import HybridFs from '../helpers/HybridFs';
import { Compiler, Configuration } from "webpack";
import webpack from "./Webpack";
import * as path from "path";
import * as fs from 'fs';

const memoryFs = require('memory-fs');

export default class WebpackCompiler {
  private _compiler: Compiler;
  private _fsWrapper: FsWrapper;
  private _outPath: string;
  private _outfiles: Array<string>;

  public constructor(webpackConfig: Configuration) {
    const filesystem = new HybridFs(fs, new memoryFs);
    this._fsWrapper = new FsWrapper(filesystem as any);
    this._compiler = this.createCompiler(webpackConfig, filesystem);
    this._outfiles = this.getOutFiles(webpackConfig.entry);

    const outPath = webpackConfig.output && webpackConfig.output.path;
    this._outPath = outPath || path.resolve('out');
  }

  private createCompiler(webpackConfig: Configuration, fileSystem: HybridFs): Compiler {
    // Declare as any here to avoid errors when setting filesystem
    const compiler: any = webpack(webpackConfig);

    // Setting filesystem to provided fs so compilation can be done in memory
    compiler.inputFileSystem = fileSystem;
    compiler.outputFileSystem = fileSystem;
    compiler.resolvers.normal.fileSystem = fileSystem;
    compiler.resolvers.context.fileSystem = fileSystem;

    return compiler as Compiler;
  }

  private getOutFiles(entry: Array<string> | Object | undefined): Array<string> {
    if (Array.isArray(entry)) {
      return ["bundle.js"];
    } else if (typeof entry == "object") {
      // If the entry is an object return all the keys
      return Object.keys(entry).map((name) => name + ".bundle.js");
    } else {
      return ["bundle.js"]
    }
  }

  public async writeFilesToFs(files: Array<TextFile>): Promise<void> {
    for (let file of files) {
      await this.writeToFs(file);
    }
  }

  private async writeToFs(file: TextFile): Promise<void> {
    // Make sure the file has content, the filesystem does not like empty files
    file.content = file.content || ' ';

    // Create the directory
    await this._fsWrapper.mkdirp(path.dirname(file.name));

    // Write the file to the filesystem
    await this._fsWrapper.writeFile(file.name, file.content);
  }

  public async emit(): Promise<Array<TextFile>> {
    await this.compile();

    return await this.getOutputFiles();
  }

  private async getOutputFiles(): Promise<Array<TextFile>> {
    const outfiles: Array<TextFile> = [];

    for (let outFileName of this._outfiles) {
      outfiles.push({
        content: await this._fsWrapper.readFile(path.join(this._outPath, outFileName)),
        name: outFileName,
        mutated: true, // TODO: change this to the correct value
        kind: FileKind.Text,
        transpiled: true,
        included: outFileName === "test.bundle.js"
      });
    }

    return outfiles;
  }

  private compile(): Promise<webpack.Stats> {
    return new Promise<webpack.Stats>((resolve, reject) => {
      this._compiler.run((err, stats) => {
        if (err) {
          reject(err);
        } else if (stats.hasErrors()) {
          reject(Error(stats.toString("errors-only")));
        } else {
          resolve(stats);
        }
      });
    });
  }
}