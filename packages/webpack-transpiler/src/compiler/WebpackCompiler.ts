import { File } from '@stryker-mutator/api/core';
import { Compiler, Configuration } from 'webpack';

import InputFileSystem from '../fs/InputFileSystem';
import OutputFileSystem from '../fs/OutputFileSystem';

import webpack from './Webpack';

export default class WebpackCompiler {
  private readonly _compiler: Compiler;

  constructor(webpackConfig: Configuration, private readonly _inputFS = new InputFileSystem(), private readonly _outputFS = new OutputFileSystem()) {
    this._compiler = this.createCompiler(webpackConfig);
  }

  private createCompiler(webpackConfig: Configuration): Compiler {
    const compiler = webpack(webpackConfig);
    // Setting filesystem to provided fs so compilation can be done in memory
    (compiler as any).inputFileSystem = this._inputFS;
    compiler.outputFileSystem = this._outputFS;
    (compiler as any).resolvers.normal.fileSystem = this._inputFS;
    (compiler as any).resolvers.context.fileSystem = this._inputFS;

    return compiler;
  }

  public writeFilesToFs(files: readonly File[]): void {
    files.forEach(file => this.writeToFs(file));
  }

  private writeToFs(file: File): void {
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
