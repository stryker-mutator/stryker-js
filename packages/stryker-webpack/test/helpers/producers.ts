import {Configuration, Stats} from 'webpack';
import {FileSystem} from '../../src/helpers/FsWrapper'
import {FileKind, TextFile} from 'stryker-api/core';
import {WebpackCompilerMock} from './mockInterfaces';

export function createFakeFileSystem(): FileSystem {
    return {
        readFile: () => {},
        writeFile: () => {},
        mkdir: () => {},
        stat: () => {}
    };
}

export function createFakeWebpackConfig(): Configuration {
    return {
        entry: ['index.js'],
        output: {
            path: '/out',
            filename: 'bundle.js',
        }
    };
}

export function createTextFile(name: string): TextFile {
    return {
        name: name,
        content: 'c = a^2 + b^2',
        mutated: true,
        included: true,
        transpiled: true,
        kind: FileKind.Text
    };
}

export function createWebpackMock(): WebpackCompilerMock {
    return {
        run: (callback: (err: Error, stats: Stats) => void) => {},
        inputFileSystem: { fileSystem: { } },
        outputFileSystem: { fileSystem: { } },
        resolvers: { 
            normal: { fileSystem: {} }, 
            context: { fileSystem: {} } 
        }
    }
}