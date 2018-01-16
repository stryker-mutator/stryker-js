import { TextFile, File, BinaryFile, FileKind } from 'stryker-api/core';
import { Compiler, Configuration } from 'webpack';
import webpack from './Webpack';
import * as path from 'path';
import InputFileSystem from '../fs/InputFileSystem';
import OutputFileSystem from '../fs/OutputFileSystem';
import OutputSorterPlugin from './OutputSorterPlugin';

export default class WebpackCompiler {
  private _compiler: Compiler;
  private _inputFS = new InputFileSystem();
  private _outputFS = new OutputFileSystem();
  private _sorter = new OutputSorterPlugin();

  public constructor(webpackConfig: Configuration) {
    this._compiler = this.createCompiler(webpackConfig);
  }

  private createCompiler(webpackConfig: Configuration): Compiler {
    const plugins = webpackConfig.plugins || (webpackConfig.plugins = []);
    plugins.push(this._sorter);
    const compiler = webpack(webpackConfig);

    // Setting filesystem to provided fs so compilation can be done in memory
    (compiler as any).inputFileSystem = this._inputFS;
    compiler.outputFileSystem = this._outputFS;
    (compiler as any).resolvers.normal.fileSystem = this._inputFS;
    (compiler as any).resolvers.context.fileSystem = this._inputFS;

    return compiler as Compiler;
  }

  public writeFilesToFs(files: Array<File>): void {
    for (let file of files) {
      if (file.kind !== FileKind.Web) {
        this.writeToFs(file);
      }
    }
  }

  private writeToFs(file: TextFile | BinaryFile): void {
    // Create the directory
    this._inputFS.mkdirpSync(path.dirname(file.name));

    // Write the file to the filesystem
    this._inputFS.writeFileSync(file.name, file.content);
  }

  public emit(): Promise<File[]> {
    return this.compile().then(() => {
      const outputFiles = this._outputFS.collectFiles();
      this._outputFS.purge();

      const sortedFiles = this._sorter.sortedFileNames;
      outputFiles.sort((a, b) => {
        const aName = path.basename(a.name);
        const bName = path.basename(b.name);
        return sortedFiles.indexOf(aName) - sortedFiles.indexOf(bName);
      });
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