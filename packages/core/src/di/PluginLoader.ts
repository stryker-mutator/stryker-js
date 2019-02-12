import * as path from 'path';
import { Logger } from '@stryker-mutator/api/logging';
import * as _ from 'lodash';
import { tokens } from 'typed-inject';
import { importModule } from '../utils/fileUtils';
import { fsAsPromised } from '@stryker-mutator/util';
import { Plugin, PluginKind, PluginResolver, Plugins, commonTokens } from '@stryker-mutator/api/plugin';
import * as coreTokens from './coreTokens';

const IGNORED_PACKAGES = ['stryker-cli', 'stryker-api'];

interface PluginModule {
  strykerPlugins: Plugin<any, any>[];
}

export class PluginLoader implements PluginResolver {
  private readonly pluginsByKind: Map<PluginKind, Plugin<any, any>[]> = new Map();

  public static inject = tokens(commonTokens.logger, coreTokens.pluginDescriptors);
  constructor(private readonly log: Logger, private readonly pluginDescriptors: ReadonlyArray<string>) { }

  public load() {
    this.resolvePluginModules().forEach(moduleName => this.requirePlugin(moduleName));
  }

  public resolve<T extends keyof Plugins>(kind: T, name: string): Plugins[T] {
    const plugins = this.pluginsByKind.get(kind);
    if (plugins) {
      const plugin = plugins.find(plugin => plugin.name.toLowerCase() === name.toLowerCase());
      if (plugin) {
        return plugin as any;
      } else {
        throw new Error(`Cannot load ${kind} plugin "${name}". Did you forget to install it? Loaded ${kind
          } plugins were: ${plugins.map(p => p.name).join(', ')}`);
      }
    } else {
      throw new Error(`Cannot load ${kind} plugin "${name}". In fact, no ${kind} plugins were loaded. Did you forget to install it?`);
    }
  }

  public resolveAll<T extends keyof Plugins>(kind: T): Plugins[T][] {
    const plugins = this.pluginsByKind.get(kind);
    return plugins || [] as any;
  }

  private resolvePluginModules() {
    const modules: string[] = [];
    this.pluginDescriptors.forEach(pluginExpression => {
      if (_.isString(pluginExpression)) {
        if (pluginExpression.indexOf('*') !== -1) {

          // Plugin directory is the node_modules folder of the module that installed stryker
          // So if current __dirname is './stryker/src/di' so 3 directories above
          const pluginDirectory = path.resolve(__dirname, '..', '..', '..');
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

  private loadPlugin(plugin: Plugin<any, any>) {
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
