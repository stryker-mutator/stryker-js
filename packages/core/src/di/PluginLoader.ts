import * as path from 'path';
import { readdirSync } from 'fs';

import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, Plugin, PluginKind, PluginResolver, Plugins } from '@stryker-mutator/api/plugin';
import { tokens } from 'typed-inject';

import { importModule } from '../utils/fileUtils';

import * as coreTokens from './coreTokens';

const IGNORED_PACKAGES = ['core', 'api', 'util'];

interface PluginModule {
  strykerPlugins: Array<Plugin<any>>;
}

interface SchemaValidationContribution {
  strykerValidationSchema: object;
}

export class PluginLoader implements PluginResolver {
  private readonly pluginsByKind: Map<PluginKind, Array<Plugin<any>>> = new Map();
  private readonly contributedValidationSchemas: object[] = [];

  public static inject = tokens(commonTokens.logger, coreTokens.pluginDescriptors);
  constructor(private readonly log: Logger, private readonly pluginDescriptors: readonly string[]) {}

  public load() {
    this.resolvePluginModules().forEach((moduleName) => {
      this.requirePlugin(moduleName);
    });
  }

  public resolveValidationSchemaContributions(): object[] {
    return this.contributedValidationSchemas;
  }

  public resolve<T extends keyof Plugins>(kind: T, name: string): Plugins[T] {
    const plugins = this.pluginsByKind.get(kind);
    if (plugins) {
      const plugin = plugins.find((plugin) => plugin.name.toLowerCase() === name.toLowerCase());
      if (plugin) {
        return plugin as any;
      } else {
        throw new Error(
          `Cannot load ${kind} plugin "${name}". Did you forget to install it? Loaded ${kind} plugins were: ${plugins.map((p) => p.name).join(', ')}`
        );
      }
    } else {
      throw new Error(`Cannot load ${kind} plugin "${name}". In fact, no ${kind} plugins were loaded. Did you forget to install it?`);
    }
  }

  public resolveAll<T extends keyof Plugins>(kind: T): Array<Plugins[T]> {
    const plugins = this.pluginsByKind.get(kind);
    return plugins || ([] as any);
  }

  private resolvePluginModules() {
    const modules: string[] = [];
    this.pluginDescriptors.forEach((pluginExpression) => {
      if (typeof pluginExpression === 'string') {
        if (pluginExpression.includes('*')) {
          // Plugin directory is the node_modules folder of the module that installed stryker
          // So if current __dirname is './@stryker-mutator/core/src/di' so 4 directories above
          const pluginDirectory = path.dirname(path.resolve(__dirname, '..', '..', '..', '..', pluginExpression));
          const regexp = new RegExp('^' + path.basename(pluginExpression).replace('*', '.*'));

          this.log.debug('Loading %s from %s', pluginExpression, pluginDirectory);
          const plugins = readdirSync(pluginDirectory)
            .filter((pluginName) => !IGNORED_PACKAGES.includes(pluginName) && regexp.test(pluginName))
            .map((pluginName) => path.resolve(pluginDirectory, pluginName));
          if (plugins.length === 0) {
            this.log.debug('Expression %s not resulted in plugins to load', pluginExpression);
          }
          plugins
            .map((plugin) => {
              this.log.debug('Loading plugin "%s" (matched with expression %s)', plugin, pluginExpression);
              return plugin;
            })
            .forEach((p) => modules.push(p));
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
        module.strykerPlugins.forEach((plugin) => this.loadPlugin(plugin));
      }
      if (this.hasValidationSchemaContribution(module)) {
        this.contributedValidationSchemas.push(module.strykerValidationSchema);
      }
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
        this.log.warn('Cannot find plugin "%s".\n  Did you forget to install it ?\n' + '  npm install %s --save-dev', name, name);
      } else {
        this.log.warn('Error during loading "%s" plugin:\n  %s', name, e.message);
      }
    }
  }

  private loadPlugin(plugin: Plugin<any>) {
    let plugins = this.pluginsByKind.get(plugin.kind);
    if (!plugins) {
      plugins = [];
      this.pluginsByKind.set(plugin.kind, plugins);
    }
    plugins.push(plugin);
  }

  private isPluginModule(module: unknown): module is PluginModule {
    const pluginModule = module as PluginModule;
    return pluginModule && pluginModule.strykerPlugins && Array.isArray(pluginModule.strykerPlugins);
  }

  private hasValidationSchemaContribution(module: unknown): module is SchemaValidationContribution {
    const pluginModule = module as SchemaValidationContribution;
    return pluginModule && pluginModule.strykerValidationSchema && typeof pluginModule.strykerValidationSchema === 'object';
  }
}
