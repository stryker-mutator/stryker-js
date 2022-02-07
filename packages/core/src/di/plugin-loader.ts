import path from 'path';
import { readdirSync } from 'fs';

import { fileURLToPath } from 'url';

import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, Plugin, PluginKind, Plugins } from '@stryker-mutator/api/plugin';
import { notEmpty } from '@stryker-mutator/util';
import { tokens } from 'typed-inject';

import { fileUtils } from '../utils/file-utils.js';

const IGNORED_PACKAGES = ['core', 'api', 'util'];

interface PluginModule {
  strykerPlugins: Array<Plugin<PluginKind>>;
}

interface SchemaValidationContribution {
  strykerValidationSchema: Record<string, unknown>;
}

/**
 * Can resolve modules and pull them into memory
 */
export class PluginLoader {
  private readonly pluginsByKind: Map<PluginKind, Array<Plugin<PluginKind>>> = new Map();
  private readonly contributedValidationSchemas: Array<Record<string, unknown>> = [];

  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}
  public async load(pluginDescriptors: readonly string[]): Promise<readonly string[]> {
    const pluginModules = await Promise.all(this.resolvePluginModules(pluginDescriptors).map((moduleName) => this.loadPlugin(moduleName)));
    return pluginModules.filter(notEmpty);
  }

  public resolveValidationSchemaContributions(): Array<Record<string, unknown>> {
    return this.contributedValidationSchemas;
  }

  public getValidationSchemaContributions(): Array<Record<string, unknown>> {
    return this.contributedValidationSchemas;
  }

  public resolve<T extends keyof Plugins>(kind: T, name: string): Plugins[T] {
    const plugins = this.pluginsByKind.get(kind);
    if (plugins) {
      const pluginFound = plugins.find((plugin) => plugin.name.toLowerCase() === name.toLowerCase());
      if (pluginFound) {
        return pluginFound as Plugins[T];
      } else {
        throw new Error(
          `Cannot load ${kind} plugin "${name}". Did you forget to install it? Loaded ${kind} plugins were: ${plugins.map((p) => p.name).join(', ')}`
        );
      }
    } else {
      throw new Error(`Cannot load ${kind} plugin "${name}". In fact, no ${kind} plugins were loaded. Did you forget to install it?`);
    }
  }

  private resolvePluginModules(pluginDescriptors: readonly string[]) {
    const modules: string[] = [];
    pluginDescriptors.forEach((pluginExpression) => {
      if (typeof pluginExpression === 'string') {
        if (pluginExpression.includes('*')) {
          // Plugin directory is the node_modules folder of the module that installed stryker
          // So if current __dirname is './@stryker-mutator/core/dist/src/di' so 4 directories above
          const pluginDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..');
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

  private async loadPlugin(name: string): Promise<string | undefined> {
    this.log.debug(`Loading plugins ${name}`);
    try {
      const module = await fileUtils.importModule(name);
      if (this.isPluginModule(module)) {
        module.strykerPlugins.forEach((plugin) => this.registerPlugin(plugin));
      }
      if (this.hasValidationSchemaContribution(module)) {
        this.contributedValidationSchemas.push(module.strykerValidationSchema);
      }
      return name;
    } catch (e: any) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
        this.log.warn('Cannot find plugin "%s".\n  Did you forget to install it ?\n' + '  npm install %s --save-dev', name, name);
      } else {
        this.log.warn('Error during loading "%s" plugin:\n  %s', name, e.message);
      }
      return;
    }
  }

  private registerPlugin(plugin: Plugin<PluginKind>) {
    let plugins = this.pluginsByKind.get(plugin.kind);
    if (!plugins) {
      plugins = [];
      this.pluginsByKind.set(plugin.kind, plugins);
    }
    plugins.push(plugin);
  }

  private isPluginModule(module: unknown): module is PluginModule {
    const pluginModule = module as PluginModule;
    return Array.isArray(pluginModule?.strykerPlugins);
  }

  private hasValidationSchemaContribution(module: unknown): module is SchemaValidationContribution {
    const pluginModule = module as SchemaValidationContribution;
    return typeof pluginModule?.strykerValidationSchema === 'object';
  }
}
