import { Stats } from 'webpack';

export interface WebpackCompilerMock {
    inputFileSystem: { fileSystem: any };
    outputFileSystem: { fileSystem: any };
    resolvers: { context: { fileSystem: any }; normal: { fileSystem: any } };
    run(callback: (err: Error, stats: Stats) => void): void;
}
