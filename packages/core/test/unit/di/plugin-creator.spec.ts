import { expect } from 'chai';
import sinon from 'sinon';
import { ClassPlugin, FactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';

import { coreTokens, PluginCreator, PluginLoader } from '../../../src/di/index.js';

describe(PluginCreator.name, () => {
  let sut: PluginCreator;
  let pluginLoaderMock: sinon.SinonStubbedInstance<PluginLoader>;

  beforeEach(() => {
    pluginLoaderMock = sinon.createStubInstance(PluginLoader);
    sut = testInjector.injector.provideValue(coreTokens.pluginLoader, pluginLoaderMock).injectClass(PluginCreator);
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
    pluginLoaderMock.resolve.returns(factoryPlugin);

    // Act
    const actualReporter = sut.create(PluginKind.Reporter, 'fooReporter');

    // Assert
    expect(pluginLoaderMock.resolve).calledWith(PluginKind.Reporter, 'fooReporter');
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
    pluginLoaderMock.resolve.returns(plugin);

    // Act
    const actualReporter = sut.create(PluginKind.Reporter, 'fooReporter');

    // Assert
    expect(pluginLoaderMock.resolve).calledWith(PluginKind.Reporter, 'fooReporter');
    expect(actualReporter).instanceOf(FooReporter);
  });

  it('should throw if plugin is not recognized', () => {
    // @ts-expect-error Testing wrong plugin format by choice
    pluginLoaderMock.resolve.returns({});
    expect(() => sut.create(PluginKind.Reporter, 'foo')).throws(
      'Plugin "Reporter:foo" could not be created, missing "factory" or "injectableClass" property.'
    );
  });
});
