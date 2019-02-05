import { createPlugin } from '../../../src/di/createPlugin';
import { PluginKind, FactoryPlugin, ClassPlugin } from 'stryker-api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

describe('createPlugin', () => {
  it('should create a FactoryPlugin using it\'s factory method', () => {
    const expectedReporter = factory.reporter();
    const plugin: FactoryPlugin<PluginKind.Reporter, []> = {
      kind: PluginKind.Reporter,
      name: 'fooReporter',
      factory() {
        return expectedReporter;
      }
    };
    const actualReporter = createPlugin(PluginKind.Reporter, plugin, testInjector.injector);
    expect(actualReporter).eq(expectedReporter);
  });

  it('should create a ClassPlugin using it\'s constructor', () => {
    class FooReporter {
    }
    const plugin: ClassPlugin<PluginKind.Reporter, []> = {
      injectableClass: FooReporter,
      kind: PluginKind.Reporter,
      name: 'fooReporter'
    };
    const actualReporter = createPlugin(PluginKind.Reporter, plugin, testInjector.injector);
    expect(actualReporter).instanceOf(FooReporter);
  });

  it('should throw if plugin is not recognized', () => {
    expect(() => createPlugin(PluginKind.Reporter, { name: 'foo' } as any, testInjector.injector))
      .throws('Plugin "Reporter:foo" could not be created, missing "factory" or "injectableClass" property.');
  });
});
