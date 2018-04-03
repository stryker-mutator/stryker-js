import { Configuration, Stats } from 'webpack';
import { WebpackCompilerMock } from './mockInterfaces';
import * as sinon from 'sinon';
import { Chunk } from '../../src/compiler/FileSorter';
import { StrykerWebpackConfig } from '../../src/WebpackTranspiler';
import { File } from 'stryker-api/core';

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

export function createTextFile(name: string): File {
  return new File(name, 'c = a^2 + b^2');
}

function createFactory<T>(defaultFn: () => T): (overrides?: Partial<T>) => T {
  return overrides => Object.assign(defaultFn(), overrides);
}

export function createStats(chunks: Chunk[]) {
  return {
    hasErrors: () => false,
    toJson() {
      return {
        chunks
      };
    }
  };
}

export const createChunk = createFactory<Chunk>(() => ({
  files: [],
  id: '1',
  parents: []
}));

export const createStrykerWebpackConfig = createFactory<StrykerWebpackConfig>(() => ({
  configFile: undefined,
  silent: true,
  context: '/path/to/project/root'
}));

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