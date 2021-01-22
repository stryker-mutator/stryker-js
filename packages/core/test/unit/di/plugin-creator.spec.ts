import { ClassPlugin, FactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { PluginCreator } from '../../../src/di/plugin-creator';

describe('PluginCreator', () => {
  let sut: PluginCreator<PluginKind.Reporter>;

  beforeEach(() => {
    sut = testInjector.injector.injectFunction(PluginCreator.createFactory(PluginKind.Reporter));
  });

  it("should create a FactoryPlugin using it's factory method", () => {
    // Arrange
    const expectedReporter = factory.reporter('fooReporter');
    const factoryPlugin: FactoryPlugin<PluginKind.Reporter, []> = {
      kind: PluginKind.Reporter,
      name: 'fooReporter',
      factory() {
        return expectedReporter;
      },
    };
    testInjector.pluginResolver.resolve.returns(factoryPlugin);

    // Act
    const actualReporter = sut.create('fooReporter');

    // Assert
    expect(testInjector.pluginResolver.resolve).calledWith(PluginKind.Reporter, 'fooReporter');
    expect(actualReporter).eq(expectedReporter);
  });

  it("should create a ClassPlugin using it's constructor", () => {
    // Arrange
    class FooReporter {}
    const plugin: ClassPlugin<PluginKind.Reporter, []> = {
      injectableClass: FooReporter,
      kind: PluginKind.Reporter,
      name: 'fooReporter',
    };
    testInjector.pluginResolver.resolve.returns(plugin);

    // Act
    const actualReporter = sut.create('fooReporter');

    // Assert
    expect(testInjector.pluginResolver.resolve).calledWith(PluginKind.Reporter, 'fooReporter');
    expect(actualReporter).instanceOf(FooReporter);
  });

  it('should throw if plugin is not recognized', () => {
    // @ts-expect-error Testing wrong plugin format by choice
    testInjector.pluginResolver.resolve.returns({});
    expect(() => sut.create('foo')).throws('Plugin "Reporter:foo" could not be created, missing "factory" or "injectableClass" property.');
  });
});
