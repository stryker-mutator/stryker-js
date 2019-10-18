import { File } from '@stryker-mutator/api/core';
import * as sinon from 'sinon';
import { Configuration } from 'webpack';
import { StrykerWebpackConfig } from '../../src/WebpackTranspiler';
import { WebpackCompilerMock } from './mockInterfaces';

export type Mock<T> = { [K in keyof T]: sinon.SinonStub };

export type Constructor<T> = new (...args: any[]) => T;

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
    run: () => {}
  };
}
