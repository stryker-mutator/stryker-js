import { Configuration, Stats } from 'webpack';
import { FileKind, TextFile } from 'stryker-api/core';
import { WebpackCompilerMock } from './mockInterfaces';
import * as sinon from 'sinon';

export type Mock<T> = {
  [K in keyof T]: sinon.SinonStub;
};

export type Constructor<T> = { new(...args: any[]): T };

export function createMockInstance<T>(type: Constructor<T>) {
  return sinon.createStubInstance(type) as Mock<T>;
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
    run: (callback: (err: Error, stats: Stats) => void) => { },
    inputFileSystem: { fileSystem: {} },
    outputFileSystem: { fileSystem: {} },
    resolvers: {
      normal: { fileSystem: {} },
      context: { fileSystem: {} }
    }
  };
}