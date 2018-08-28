import { Configuration, Stats } from 'webpack';
import { WebpackCompilerMock } from './mockInterfaces';
import * as sinon from 'sinon';
import { StrykerWebpackConfig } from '../../src/WebpackTranspiler';
import { File } from 'stryker-api/core';

export type Mock<T> = { [K in keyof T]: sinon.SinonStub; };

export interface Constructor<T> { new(...args: any[]): T; }

export function createMockInstance<T>(type: Constructor<T>) {
  return sinon.createStubInstance(type) as Mock<T>;
}

export function createFakeWebpackConfig(): Configuration {
  return {
    entry: ['index.js'],
    output: {
      filename: 'bundle.js',
      path: '/out'
    }
  };
}

export function createTextFile(name: string): File {
  return new File(name, 'c = a^2 + b^2');
}

function createFactory<T>(defaultFn: () => T): (overrides?: Partial<T>) => T {
  return overrides => Object.assign(defaultFn(), overrides);
}

export const createStrykerWebpackConfig = createFactory<StrykerWebpackConfig>(() => ({
  configFile: undefined,
  context: '/path/to/project/root',
  silent: true
}));

export function createWebpackMock(): WebpackCompilerMock {
  return {
    inputFileSystem: { fileSystem: {} },
    outputFileSystem: { fileSystem: {} },
    resolvers: {
      context: { fileSystem: {} },
      normal: { fileSystem: {} }
    },
    run: (callback: (err: Error, stats: Stats) => void) => { }
  };
}
