import { TextFile, File, BinaryFile } from 'stryker-api/core';
import { Compiler, Configuration } from 'webpack';
import webpack from './Webpack';
import * as path from 'path';
import InputFileSystem from '../fs/InputFileSystem';
import OutputFileSystem from '../fs/OutputFileSystem';

export default class WebpackCompiler {
  private _compiler: Compiler;
  private _inputFS = new InputFileSystem();
  private _outputFS = new OutputFileSystem();

  public constructor(webpackConfig: Configuration) {
    this._compiler = this.createCompiler(webpackConfig);
  }

  private createCompiler(webpackConfig: Configuration): Compiler {
    // Declare as any here to avoid errors when setting filesystem
    const compiler: any = webpack(webpackConfig);

    // Setting filesystem to provided fs so compilation can be done in memory
    compiler.inputFileSystem = this._inputFS;
    compiler.outputFileSystem = this._outputFS;
    compiler.resolvers.normal.fileSystem = this._inputFS;
    compiler.resolvers.context.fileSystem = this._inputFS;

    return compiler as Compiler;
  }

  public writeFilesToFs(files: Array<TextFile | BinaryFile>): void {
    for (let file of files) {
      this.writeToFs(file);
    }
  }

  private writeToFs(file: TextFile | BinaryFile): void {
    // Make sure the file has content, the filesystem does not like empty files
    file.content = file.content || ' ';

    // Create the directory
    this._inputFS.mkdirpSync(path.dirname(file.name));

    // Write the file to the filesystem
    this._inputFS.writeFileSync(file.name, file.content);
  }

  public emit(): Promise<File[]> {
    return this.compile().then(() => {
      const outputFiles = this._outputFS.collectFiles();
      this._outputFS.purge();
      return outputFiles;
    });
  }

  private compile(): Promise<webpack.Stats> {
    return new Promise<webpack.Stats>((resolve, reject) => {
      this._compiler.run((err, stats) => {
        if (err) {
          reject(err);
        } else if (stats.hasErrors()) {
          reject(Error(stats.toString('errors-only')));
        } else {
          resolve(stats);
        }
      });
    });
  }
}