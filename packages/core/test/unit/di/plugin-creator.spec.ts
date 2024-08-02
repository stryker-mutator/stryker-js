import { expect } from 'chai';
import { ClassPlugin, FactoryPlugin, Plugin, PluginKind, ValuePlugin } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';

import { coreTokens, PluginCreator } from '../../../src/di/index.js';

describe(PluginCreator.name, () => {
  let sut: PluginCreator;
  let pluginsByKind: Map<PluginKind, Array<Plugin<PluginKind>>>;

  beforeEach(() => {
    pluginsByKind = new Map();
    sut = testInjector.injector.provideValue(coreTokens.pluginsByKind, pluginsByKind).injectClass(PluginCreator);
  });

  it("should create a FactoryPlugin using it's factory method", () => {
    // Arrange
    const expectedReporter = factory.reporter('foo');
    const factoryPlugin: FactoryPlugin<PluginKind.Reporter, []> = {
      kind: PluginKind.Reporter,
      name: 'foo',
      factory() {
        return expectedReporter;
      },
    };
    pluginsByKind.set(PluginKind.Reporter, [factoryPlugin]);

    // Act
    const actualReporter = sut.create(PluginKind.Reporter, 'foo');

    // Assert
    expect(actualReporter).eq(expectedReporter);
  });

  it("should create a ClassPlugin using it's constructor", () => {
    // Arrange
    class FooReporter {}
    const classPlugin: ClassPlugin<PluginKind.Reporter, []> = {
      injectableClass: FooReporter,
      kind: PluginKind.Reporter,
      name: 'foo',
    };
    pluginsByKind.set(PluginKind.Reporter, [classPlugin]);

    // Act
    const actualReporter = sut.create(PluginKind.Reporter, 'foo');

    // Assert
    expect(actualReporter).instanceOf(FooReporter);
  });

  it("should return a ValuePlugin using it's value", () => {
    // Arrange
    const expectedReporter = factory.reporter('foo');
    const valuePlugin: ValuePlugin<PluginKind.Reporter> = {
      kind: PluginKind.Reporter,
      name: 'foo',
      value: expectedReporter,
    };
    pluginsByKind.set(PluginKind.Reporter, [valuePlugin]);

    // Act
    const actualReporter = sut.create(PluginKind.Reporter, 'foo');

    // Assert
    expect(actualReporter).eq(expectedReporter);
  });

  it('should match plugins on name ignore case', () => {
    // Arrange
    const expectedReporter = factory.reporter('bar');
    pluginsByKind.set(PluginKind.Reporter, [
      {
        kind: PluginKind.Reporter,
        name: 'foo',
        factory: factory.reporter,
      },
      {
        kind: PluginKind.Reporter,
        name: 'bar',
        factory() {
          return expectedReporter;
        },
      },
      {
        kind: PluginKind.Reporter,
        name: 'baz',
        factory: factory.reporter,
      },
    ]);

    // Act
    const actualReporter = sut.create(PluginKind.Reporter, 'bAr');

    // Assert
    expect(actualReporter).eq(expectedReporter);
  });

  it('should throw if plugin is not recognized', () => {
    // @ts-expect-error: Error plugin, to be expected
    const errorPlugin: ClassPlugin<PluginKind.Reporter, []> = {
      kind: PluginKind.Reporter,
      name: 'foo',
    };
    pluginsByKind.set(PluginKind.Reporter, [errorPlugin]);
    expect(() => sut.create(PluginKind.Reporter, 'foo')).throws(
      'Plugin "Reporter:foo" could not be created, missing "factory", "injectableClass" or "value" property',
    );
  });

  it('should throw if the plugin cannot be found', () => {
    expect(() => sut.create(PluginKind.Checker, 'chess')).throws(
      'Cannot find Checker plugin "chess". In fact, no Checker plugins were loaded. Did you forget to install it?',
    );
  });

  it('should throw if the plugin cannot be found, but other plugins of its kind could', () => {
    pluginsByKind.set(PluginKind.Reporter, [
      { kind: PluginKind.Reporter, factory: factory.reporter, name: 'foo' },
      { kind: PluginKind.Reporter, factory: factory.reporter, name: 'bar' },
    ]);
    expect(() => sut.create(PluginKind.Reporter, 'chess')).throws(
      'Cannot find Reporter plugin "chess". Did you forget to install it? Loaded Reporter plugins were: foo, bar',
    );
  });
});
