import { tokens, PluginResolver, token } from 'stryker-api/di';
import { Config } from 'stryker-api/config';
import { Logger, LoggerFactoryMethod, getLogger } from 'stryker-api/logging';
import Injector from '../../../src/di/Injector';
import { StrykerOptions } from 'stryker-api/core';
import * as sinon from 'sinon';
import { expect } from 'chai';
import currentLogMock from '../../helpers/logMock';
import { strykerOptions } from '../../helpers/producers';

describe('Injector', () => {

  let pluginResolver: PluginResolver;
  let config: Config;
  let sut: Injector;

  beforeEach(() => {
    pluginResolver = {
      resolve: sinon.stub()
    };
    config = new Config();
    sut = Injector.create(pluginResolver, config);
  });

  describe('RootInjector', () => {

    it('should be able to inject config, log, getLogger, options and pluginResolver class', () => {
      // Arrange
      class Injectable {
        constructor(
          public readonly config: Config,
          public readonly log: Logger,
          public readonly getLogger: LoggerFactoryMethod,
          public readonly options: StrykerOptions,
          public readonly pluginResolver: PluginResolver) {
        }
        public static inject = tokens('config', 'logger', 'getLogger', 'options', 'pluginResolver');
      }

      // Act
      const actual = sut.inject(Injectable);

      // Assert
      expect(actual.config).eq(config);
      expect(actual.options).eq(config);
      expect(actual.log).eq(currentLogMock());
      expect(actual.getLogger).eq(getLogger);
      expect(actual.pluginResolver).eq(pluginResolver);
    });

    it('should throw when no provider was found', () => {
      expect(() => sut.inject(class FileNamesInjectable {
        constructor(public fileNames: ReadonlyArray<string>) {
        }
        public static inject = tokens('sandboxFileNames');
      })).throws('Can not inject "FileNamesInjectable". No provider found for "sandboxFileNames".');
    });
  });

  describe('ChildInjector', () => {

    it('should be able to inject testFileNames', () => {
      const expectedFileNames = Object.freeze(['foo.js', 'bar.js']);
      const child = sut.createChildInjector({
        sandboxFileNames: {
          value: expectedFileNames
        }
      });
      const actual = child.inject(class {
        constructor(public sandboxFileNames: ReadonlyArray<string>) { }
        public static inject = tokens('sandboxFileNames');
      });
      expect(actual.sandboxFileNames).eq(expectedFileNames);
    });

    it('should be able still provide parent injector values', () => {
      const expectedOptions = strykerOptions();
      const child = sut.createChildInjector({
        options: {
          value: expectedOptions
        }
      });
      const actual = child.inject(class {
        constructor(public options: StrykerOptions, public getLogger: LoggerFactoryMethod) { }
        public static inject = tokens('options', 'getLogger');
      });
      expect(actual.options).eq(expectedOptions);
      expect(actual.getLogger).eq(getLogger);
    });
  });

  it('should be able to inject a dependency tree', () => {
    // Arrange
    class GrandChild {
      public baz = 'qux';
      constructor(public log: Logger) {
      }
      public static inject = tokens('logger');
    }
    class Child1 {
      public bar = 'foo';
      constructor(public log: Logger, public grandchild: GrandChild) {
      }
      public static inject = tokens('logger', token(GrandChild));
    }
    class Child2 {
      public foo = 'bar';
      constructor(public log: Logger) {
      }
      public static inject = tokens('logger');
    }
    class Parent {
      constructor(
        public readonly child: Child1,
        public readonly child2: Child2,
        public readonly log: Logger) {
      }
      public static inject = tokens(token(Child1), token(Child2), 'logger');
    }

    // Act
    const actual = sut.inject(Parent);

    // Assert
    expect(actual.child.bar).eq('foo');
    expect(actual.child2.foo).eq('bar');
    expect(actual.child.log).eq(currentLogMock());
    expect(actual.child2.log).eq(currentLogMock());
    expect(actual.child.grandchild.log).eq(currentLogMock());
    expect(actual.child.grandchild.baz).eq('qux');
    expect(actual.log).eq(currentLogMock());
  });

});
