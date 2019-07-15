import { File } from '@stryker-mutator/api/core';
import { Compiler, Configuration } from 'webpack';
import webpack from './Webpack';
import InputFileSystem from '../fs/InputFileSystem';
import OutputFileSystem from '../fs/OutputFileSystem';

export default class WebpackCompiler {
  private readonly compiler: Compiler;

  public constructor(webpackConfig: Configuration,
                     private readonly inputFS = new InputFileSystem(),
                     private readonly outputFS = new OutputFileSystem()) {
    this.compiler = this.createCompiler(webpackConfig);
  }

  private createCompiler(webpackConfig: Configuration): Compiler {
    const compiler = webpack(webpackConfig);
    // Setting filesystem to provided fs so compilation can be done in memory
    (compiler as any).inputFileSystem = this.inputFS;
    compiler.outputFileSystem = this.outputFS;
    (compiler as any).resolvers.normal.fileSystem = this.inputFS;
    (compiler as any).resolvers.context.fileSystem = this.inputFS;

    return compiler as Compiler;
  }

  public writeFilesToFs(files: ReadonlyArray<File>): void {
    files.forEach(file => this.writeToFs(file));
  }

  private writeToFs(file: File): void {
    this.inputFS.writeFileSync(file.name, file.content);
  }

  public emit(): Promise<File[]> {
    return this.compile().then(() => {
      const outputFiles = this.outputFS.collectFiles();
      this.outputFS.purge();
      return outputFiles;
    });
  }

  private compile(): Promise<webpack.Stats> {
    return new Promise<webpack.Stats>((resolve, reject) => {
      this.compiler.run((err, stats) => {
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
