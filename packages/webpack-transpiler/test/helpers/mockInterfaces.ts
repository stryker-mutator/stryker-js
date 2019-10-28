import { Stats } from 'webpack';

export interface WebpackCompilerMock {
  run(callback: (err: Error, stats: Stats) => void): void;
  inputFileSystem: { fileSystem: any };
  outputFileSystem: { fileSystem: any };
  resolvers: { normal: { fileSystem: any }; context: { fileSystem: any } };
}
