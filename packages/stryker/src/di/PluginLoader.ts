import * as path from 'path';
import { getLogger } from 'stryker-api/logging';
import * as _ from 'lodash';
import { importModule } from '../utils/fileUtils';
import { fsAsPromised } from '@stryker-mutator/util';
import { StrykerPlugin, PluginKind, keys, InjectorKey, ContainerValues, PluginResolver } from 'stryker-api/di';
import { ConfigEditorFactory } from 'stryker-api/config';
import { Factory } from 'stryker-api/core';
import { ReporterFactory } from 'stryker-api/report';
import { TestFrameworkFactory } from 'stryker-api/test_framework';
import { TestRunnerFactory } from 'stryker-api/test_runner';
import { TranspilerFactory } from 'stryker-api/transpile';
import MutatorFactory from 'stryker-api/src/mutant/MutatorFactory';

const IGNORED_PACKAGES = ['stryker-cli', 'stryker-api'];

interface PluginModule {
  strykerPlugins: StrykerPlugin<unknown, any>[];
}

export default class PluginLoader implements PluginResolver {
  private readonly log = getLogger(PluginLoader.name);
  private readonly pluginsByKind: Map<PluginKind, StrykerPlugin<unknown, any>[]> = new Map();

  constructor(private readonly pluginDescriptors: string[]) { }

  public load() {
    this.resolvePluginModules().forEach(moduleName => this.requirePlugin(moduleName));
    this.loadDeprecatedPlugins();
  }

  public resolve(kind: PluginKind, name: string): StrykerPlugin<unknown, InjectorKey[]> {
    return this.getPlugin(kind, name);
  }

  public getPlugin(kind: PluginKind, name: string): StrykerPlugin<unknown, InjectorKey[]> {
    const plugins = this.pluginsByKind.get(kind);
    if (plugins) {
      const plugin = plugins.find(plugin => plugin.pluginName.toLowerCase() === name.toLowerCase());
      if (plugin) {
        return plugin;
      } else {
        throw new Error(`Cannot load ${kind} plugin "${name}". Did you forget to install it? Loaded ${kind} plugins were: ${plugins.map(p => p.pluginName).join(', ')}`);
      }
    } else {
      throw new Error(`Cannot load ${kind} plugin "${name}". In fact, no ${kind} plugins were loaded. Did you forget to install it?`);
    }
  }

  private loadDeprecatedPlugins() {
    this.loadDeprecatedPluginsFor(PluginKind.ConfigEditor, ConfigEditorFactory.instance(), [], () => undefined);
    this.loadDeprecatedPluginsFor(PluginKind.Reporter, ReporterFactory.instance(), keys('config'), ([config]) => config);
    this.loadDeprecatedPluginsFor(PluginKind.TestFramework, TestFrameworkFactory.instance(), keys('options'), args => ({ options: args[0] }));
    this.loadDeprecatedPluginsFor(PluginKind.Transpiler, TranspilerFactory.instance(), keys('config', 'produceSourceMaps'),
      ([config, produceSourceMaps]) => ({ config, produceSourceMaps }));
    this.loadDeprecatedPluginsFor(PluginKind.Mutator, MutatorFactory.instance(), keys('config'), ([config]) => config);
    this.loadDeprecatedPluginsFor(PluginKind.TestRunner, TestRunnerFactory.instance(), keys('options', 'sandboxFileNames'),
      ([strykerOptions, fileNames]) => ({ strykerOptions, fileNames }));
  }

  private loadDeprecatedPluginsFor<TSettings, TS extends InjectorKey[]>(
    kind: PluginKind,
    factory: Factory<TSettings, object>,
    injectionKeys: TS,
    settingsFactory: (args: ContainerValues<TS>) => TSettings): void {
    factory.knownNames().forEach(name => {
      class ProxyPlugin {
        constructor(...args: ContainerValues<TS>) {
          const realPlugin = factory.create(name, settingsFactory(args));
          for (const i in realPlugin) {
            const method = (realPlugin as any)[i];
            if (method === 'function') {
              (this as any)[i] = method.bind(realPlugin);
            }
          }
        }
        public static pluginName = name;
        public static kind = kind;
        public static inject = injectionKeys;
      }
      this.loadPlugin(ProxyPlugin);
    });
  }

  private resolvePluginModules() {
    const modules: string[] = [];
    this.pluginDescriptors.forEach(pluginExpression => {
      if (_.isString(pluginExpression)) {
        if (pluginExpression.indexOf('*') !== -1) {

          // Plugin directory is the node_modules folder of the module that installed stryker
          // So if current __dirname is './stryker/src' than the plugin directory should be 2 directories above
          const pluginDirectory = path.resolve(__dirname, '..', '..');
          const regexp = new RegExp('^' + pluginExpression.replace('*', '.*'));

          this.log.debug('Loading %s from %s', pluginExpression, pluginDirectory);
          const plugins = fsAsPromised.readdirSync(pluginDirectory)
            .filter(pluginName => IGNORED_PACKAGES.indexOf(pluginName) === -1 && regexp.test(pluginName))
            .map(pluginName => pluginDirectory + '/' + pluginName);
          if (plugins.length === 0) {
            this.log.debug('Expression %s not resulted in plugins to load', pluginExpression);
          }
          plugins
            .map(plugin => path.basename(plugin))
            .map(plugin => {
              this.log.debug('Loading plugins %s (matched with expression %s)', plugin, pluginExpression);
              return plugin;
            })
            .forEach(p => modules.push(p));
        } else {
          modules.push(pluginExpression);
        }
      } else {
        this.log.warn('Ignoring plugin %s, as its not a string type', pluginExpression);
      }
    });

    return modules;
  }

  private requirePlugin(name: string) {
    this.log.debug(`Loading plugins ${name}`);
    try {
      const module = importModule(name);
      if (this.isPluginModule(module)) {
        module.strykerPlugins.forEach(plugin => this.loadPlugin(plugin));
      }
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
        this.log.warn('Cannot find plugin "%s".\n  Did you forget to install it ?\n' +
          '  npm install %s --save-dev', name, name);
      } else {
        this.log.warn('Error during loading "%s" plugin:\n  %s', name, e.message);
      }
    }
  }

  private loadPlugin<TS extends InjectorKey[]>(plugin: StrykerPlugin<unknown, TS>) {
    let plugins = this.pluginsByKind.get(plugin.kind);
    if (!plugins) {
      plugins = [];
      this.pluginsByKind.set(plugin.kind, plugins);
    }
    plugins.push(plugin);
  }

  private isPluginModule(module: unknown): module is PluginModule {
    const pluginModule = (module as PluginModule);
    return pluginModule && pluginModule.strykerPlugins && Array.isArray(pluginModule.strykerPlugins);
  }
}
