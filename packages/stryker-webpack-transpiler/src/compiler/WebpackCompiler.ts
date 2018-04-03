import { File } from 'stryker-api/core';
import { Compiler, Configuration } from 'webpack';
import webpack from './Webpack';
import InputFileSystem from '../fs/InputFileSystem';
import OutputFileSystem from '../fs/OutputFileSystem';
import FileSorter from './FileSorter';

export default class WebpackCompiler {
  private _compiler: Compiler;

  public constructor(webpackConfig: Configuration,
    private _inputFS = new InputFileSystem(),
    private _outputFS = new OutputFileSystem()) {
    this._compiler = this.createCompiler(webpackConfig);
  }

  private createCompiler(webpackConfig: Configuration): Compiler {
    const compiler = webpack(webpackConfig);
    // Setting filesystem to provided fs so compilation can be done in memory
    (compiler as any).inputFileSystem = this._inputFS;
    compiler.outputFileSystem = this._outputFS;
    (compiler as any).resolvers.normal.fileSystem = this._inputFS;
    (compiler as any).resolvers.context.fileSystem = this._inputFS;

    return compiler as Compiler;
  }

  public writeFilesToFs(files: ReadonlyArray<File>): void {
    files.forEach(file => this.writeToFs(file));
  }

  private writeToFs(file: File): void {
    this._inputFS.writeFileSync(file.name, file.content);
  }

  public emit(): Promise<File[]> {
    return this.compile().then(stats => {
      const outputFiles = this._outputFS.collectFiles();
      const jsonStats = stats.toJson({ chunks: true });
      this._outputFS.purge();
      return FileSorter.sort(outputFiles, jsonStats.chunks);
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