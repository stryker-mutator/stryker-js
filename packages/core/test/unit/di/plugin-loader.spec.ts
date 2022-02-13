import fs from 'fs';
import { syncBuiltinESMExports } from 'module';
import path from 'path';
import { pathToFileURL } from 'url';

import { Plugin, PluginKind } from '@stryker-mutator/api/plugin';
import { expect } from 'chai';
import sinon from 'sinon';
import { factory, testInjector } from '@stryker-mutator/test-helpers';

import { PluginLoader } from '../../../src/di/index.js';
import { fileUtils } from '../../../src/utils/file-utils.js';
import { resolveFromRoot } from '../../helpers/test-utils.js';

describe(PluginLoader.name, () => {
  let sut: PluginLoader;
  let importModuleStub: sinon.SinonStub;
  let resolve: sinon.SinonStubbedMember<typeof resolveFromRoot>;
  let readdirStub: sinon.SinonStub;

  beforeEach(() => {
    importModuleStub = sinon.stub(fileUtils, 'importModule');
    readdirStub = sinon.stub(fs.promises, 'readdir');
    resolve = sinon.stub();
    resolve.callsFake((id) => path.resolve(id));
    syncBuiltinESMExports();
    sut = testInjector.injector.injectClass(PluginLoader);
  });

  it('should import modules with a bare specifier', async () => {
    await sut.load(['a', 'b']);
    expect(fileUtils.importModule).calledWith('a');
    expect(fileUtils.importModule).calledWith('b');
  });

  it('should load local plugins using their file URLs', async () => {
    const expectedModuleA = pathToFileURL(path.resolve('a')).toString();
    const expectedModuleReporters = pathToFileURL(path.resolve('../reporter.js')).toString();
    await sut.load(['./a', '../reporter.js']);
    expect(fileUtils.importModule).calledWith(expectedModuleA);
    expect(fileUtils.importModule).calledWith(expectedModuleReporters);
  });

  it('should load absolute path plugins using their file URLs', async () => {
    const absolutePath = path.resolve('./local-test-runner.js');
    const expectedPlugin = pathToFileURL(absolutePath).toString();
    await sut.load([absolutePath]);
    expect(fileUtils.importModule).calledWith(expectedPlugin);
  });

  it('should resolve plugins matching a wildcard inside an organization from the `node_modules` directory', async () => {
    readdirStub.resolves([]);
    await sut.load(['@stryker-mutator/*']);
    expect(readdirStub).calledWith(resolveFromRoot('..', '..', '@stryker-mutator'));
  });

  it('should resolve plugins matching a wildcard from the `node_modules` directory', async () => {
    readdirStub.resolves(['my-prefix-karma-runner', 'some-other-package']);
    await sut.load(['my-prefix-*']);
    expect(readdirStub).calledWith(resolveFromRoot('..', '..'));
    expect(fileUtils.importModule).calledOnce;
    expect(fileUtils.importModule).calledWithExactly('my-prefix-karma-runner');
  });

  it('should load plugins matching a wildcard, ignoring "util", "api", "core" and "instrumenter"', async () => {
    const fooPlugin: SchemaValidationContribution = { strykerValidationSchema: { foo: 'plugin' } };
    importModuleStub.resolves(fooPlugin);
    readdirStub.resolves(['util', 'api', 'core', 'instrumenter', 'typescript-checker', 'karma-runner']);
    await sut.load(['@stryker-mutator/*']);
    expect(fileUtils.importModule).calledTwice;
    expect(fileUtils.importModule).calledWithExactly('@stryker-mutator/typescript-checker');
    expect(fileUtils.importModule).calledWithExactly('@stryker-mutator/karma-runner');
    expect(testInjector.logger.warn).not.called;
  });

  it('should log a warning when a glob expression does not yield modules', async () => {
    readdirStub.resolves(['karma-runner', 'some-other-package']);
    await sut.load(['my-prefix-*']);
    expect(testInjector.logger.warn).calledWithExactly('Expression "%s" not resulted in plugins to load.', 'my-prefix-*');
  });

  it('should log debug information when for glob expression', async () => {
    const fooPlugin: SchemaValidationContribution = { strykerValidationSchema: { foo: 'plugin' } };
    importModuleStub.resolves(fooPlugin);
    readdirStub.resolves(['karma-runner', 'some-other-package']);
    await sut.load(['*']);
    expect(testInjector.logger.debug).calledWithExactly('Loading %s from %s', '*', resolveFromRoot('..', '..'));
    expect(testInjector.logger.debug).calledWithExactly('Loading plugin "%s" (matched with expression %s)', 'karma-runner', '*');
    expect(testInjector.logger.debug).calledWithExactly('Loading plugin "%s" (matched with expression %s)', 'some-other-package', '*');
    expect(testInjector.logger.debug).calledWithExactly('Loading plugin %s', 'karma-runner');
  });

  it('should return the plugin module paths of modules that contributed plugins', async () => {
    const fooPlugin: SchemaValidationContribution = { strykerValidationSchema: { foo: 'plugin' } };
    const barPlugin: PluginModule & SchemaValidationContribution = { strykerValidationSchema: { bar: 'plugin' }, strykerPlugins: [] };
    const bazPlugin = {};
    importModuleStub.withArgs('foo').resolves(fooPlugin).withArgs('bar').resolves(barPlugin).withArgs('baz').resolves(bazPlugin);
    const result = await sut.load(['foo', 'bar', 'baz']);
    expect(result.pluginModulePaths).deep.eq(['bar']);
  });

  it('should return plugins grouped by kind', async () => {
    // Arrange
    const expectedReporters = [
      { kind: PluginKind.Reporter, factory: factory.reporter, name: 'fooReporter' },
      { kind: PluginKind.Reporter, factory: factory.reporter, name: 'bazReporter' },
    ];
    const expectedCheckers = [
      { kind: PluginKind.Checker, factory: factory.checker, name: 'fooChecker' },
      { kind: PluginKind.Checker, factory: factory.checker, name: 'barChecker' },
    ];
    const fooPlugin: PluginModule = { strykerPlugins: [expectedReporters[0], expectedCheckers[0]] };
    const bazPlugin: PluginModule = { strykerPlugins: [expectedReporters[1], expectedCheckers[1]] };
    importModuleStub.withArgs('foo').resolves(fooPlugin).withArgs('baz').resolves(bazPlugin);

    // Act
    const result = await sut.load(['foo', 'baz']);

    // Assert
    expect([...result.pluginsByKind.keys()]).deep.eq([PluginKind.Reporter, PluginKind.Checker]);
    expect(result.pluginsByKind.get(PluginKind.Reporter)).deep.eq(expectedReporters);
    expect(result.pluginsByKind.get(PluginKind.Checker)).deep.eq(expectedCheckers);
  });

  it('should return the schema contributions', async () => {
    const fooPlugin: SchemaValidationContribution = { strykerValidationSchema: { foo: 'plugin' } };
    const barPlugin: PluginModule & SchemaValidationContribution = { strykerValidationSchema: { bar: 'plugin' }, strykerPlugins: [] };
    const bazPlugin = {};
    importModuleStub.withArgs('foo').resolves(fooPlugin).withArgs('bar').resolves(barPlugin).withArgs('baz').resolves(bazPlugin);

    // Act
    const result = await sut.load(['foo', 'bar', 'baz']);

    // Assert
    expect(result.schemaContributions).deep.eq([{ foo: 'plugin' }, { bar: 'plugin' }]);
  });

  it('should not allow non-object schema contributions', async () => {
    importModuleStub.resolves({ strykerValidationSchema: 'error, should be an object' });

    // Act
    const result = await sut.load(['foo']);

    // Assert
    expect(result.schemaContributions).lengthOf(0);
  });

  it('should collect the schema contributions', async () => {
    const fooPlugin: SchemaValidationContribution = { strykerValidationSchema: { foo: 'plugin' } };
    const barPlugin: PluginModule & SchemaValidationContribution = { strykerValidationSchema: { bar: 'plugin' }, strykerPlugins: [] };
    const bazPlugin = {};
    importModuleStub.withArgs('foo').resolves(fooPlugin).withArgs('bar').resolves(barPlugin).withArgs('baz').resolves(bazPlugin);

    // Act
    const result = await sut.load(['foo', 'bar', 'baz']);

    // Assert
    expect(result.schemaContributions).deep.eq([{ foo: 'plugin' }, { bar: 'plugin' }]);
  });

  it('should log ERR_MODULE_NOT_FOUND errors as "cannot find plugin" warnings', async () => {
    importModuleStub.rejects({
      code: 'ERR_MODULE_NOT_FOUND',
      message: "Cannot find package 'a' imported from stryker-js/packages/core/dist/src/utils/file-utils.js",
    });
    await sut.load(['a']);
    expect(testInjector.logger.warn).calledWithExactly('Cannot find plugin "%s".\n  Did you forget to install it ?', 'a');
  });

  it('should log ERR_MODULE_NOT_FOUND errors for files other than the file to load as "error during loading..." warnings', async () => {
    importModuleStub.rejects({
      code: 'ERR_MODULE_NOT_FOUND',
      message: "Cannot find package 'a' imported from d.js",
    });
    await sut.load(['b']);
    expect(testInjector.logger.warn).calledWithExactly('Error during loading "%s" plugin:\n  %s', 'b', "Cannot find package 'a' imported from d.js");
  });

  it('should log errors during import as "error during loading..." warnings', async () => {
    importModuleStub.rejects({
      code: 'ERR_NOFILE',
      message: "Cannot find package 'a' imported from stryker-js/packages/core/dist/src/utils/file-utils.js",
    });
    await sut.load(['a']);
    expect(testInjector.logger.warn).calledWithExactly(
      'Error during loading "%s" plugin:\n  %s',
      'a',
      "Cannot find package 'a' imported from stryker-js/packages/core/dist/src/utils/file-utils.js"
    );
  });

  it('should log a warning when a plugin module did not yield plugins or schema contributions', async () => {
    importModuleStub.resolves({});
    await sut.load(['a']);
    expect(testInjector.logger.warn).calledWithExactly(
      'Module "%s" did not contribute a StrykerJS plugin. It didn\'t export a "%s" or "%s".',
      'a',
      'strykerPlugins',
      'strykerValidationSchema'
    );
  });
});

interface PluginModule {
  strykerPlugins: Array<Plugin<PluginKind>>;
}

interface SchemaValidationContribution {
  strykerValidationSchema: Record<string, unknown>;
}
