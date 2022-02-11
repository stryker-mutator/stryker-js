import path from 'path';
import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL, URL } from 'url';

import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens, Plugin, PluginKind, Plugins } from '@stryker-mutator/api/plugin';
import { notEmpty } from '@stryker-mutator/util';

import { fileUtils } from '../utils/file-utils.js';

const IGNORED_PACKAGES = ['core', 'api', 'util', 'instrumenter'];

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

  /**
   * Loads modules based on configured module descriptors.
   * Returns the full module paths of the modules that have been loaded.
   */
  public async load(pluginDescriptors: readonly string[]): Promise<readonly string[]> {
    const plugins = this.resolvePlugins(pluginDescriptors);
    await Promise.all(plugins.map((moduleName) => this.loadPlugin(moduleName)));
    return plugins;
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

  private resolvePlugins(pluginDescriptors: readonly string[]): string[] {
    return pluginDescriptors
      .flatMap((pluginExpression) => {
        if (typeof pluginExpression === 'string') {
          if (pluginExpression.includes('*')) {
            return this.globPlugins(pluginExpression);
          } else if (path.isAbsolute(pluginExpression) || pluginExpression.startsWith('.')) {
            return pathToFileURL(path.resolve(pluginExpression)).toString();
          } else {
            // Bare plugin expression, like "@stryker-mutator/mocha-runner"
            return pluginExpression;
          }
        } else {
          this.log.warn('Ignoring plugin %s, as its not a string type', pluginExpression);
          return;
        }
      })
      .filter(notEmpty);
  }

  private globPlugins(pluginExpression: string) {
    const { org, pkg } = parsePluginExpression(pluginExpression);

    const pluginDirectory = path.resolve(fileURLToPath(new URL('../../../../../', import.meta.url)), org);
    const regexp = new RegExp('^' + pkg.replace('*', '.*'));

    this.log.debug('Loading %s from %s', pluginExpression, pluginDirectory);
    const plugins = readdirSync(pluginDirectory)
      .filter((pluginName) => !IGNORED_PACKAGES.includes(pluginName) && regexp.test(pluginName))
      .map((pluginName) => `${org.length ? `${org}/` : ''}${pluginName}`);
    if (plugins.length === 0) {
      this.log.warn('Expression" %s" not resulted in plugins to load.', pluginExpression);
    }
    plugins.forEach((plugin) => this.log.debug('Loading plugin "%s" (matched with expression %s)', plugin, pluginExpression));
    return plugins;
  }

  private async loadPlugin(name: string): Promise<void> {
    this.log.debug(`Loading plugins ${name}`);
    try {
      const module = await fileUtils.importModule(name);
      if (this.isPluginModule(module)) {
        module.strykerPlugins.forEach((plugin) => this.registerPlugin(plugin));
      }
      if (this.hasValidationSchemaContribution(module)) {
        this.contributedValidationSchemas.push(module.strykerValidationSchema);
      }
    } catch (e: any) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
        this.log.warn('Cannot find plugin "%s".\n  Did you forget to install it ?\n' + '  npm install %s --save-dev', name, name);
      } else {
        this.log.warn('Error during loading "%s" plugin:\n  %s', name, e.message);
      }
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

/**
 * Distills organization name from a package expression.
 * @example
 *  '@stryker-mutator/core' => { org: '@stryker-mutator', 'core' }
 *  'glob' => { org: '', 'glob' }
 */
function parsePluginExpression(pluginExpression: string) {
  const parts = pluginExpression.split('/');
  if (parts.length > 1) {
    return {
      org: parts.slice(0, parts.length - 1).join('/'),
      pkg: parts[parts.length - 1],
    };
  } else {
    return {
      org: '',
      pkg: parts[0],
    };
  }
}
