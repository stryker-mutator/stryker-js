import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL, URL } from 'url';

import { Logger } from '@stryker-mutator/api/logging';
import {
  tokens,
  commonTokens,
  Plugin,
  PluginKind,
} from '@stryker-mutator/api/plugin';
import { notEmpty, propertyPath } from '@stryker-mutator/util';

import { fileUtils } from '../utils/file-utils.js';
import { defaultOptions } from '../config/options-validator.js';

const IGNORED_PACKAGES = ['core', 'api', 'util', 'instrumenter'];

interface PluginModule {
  strykerPlugins: Array<Plugin<PluginKind>>;
}

interface SchemaValidationContribution {
  strykerValidationSchema: Record<string, unknown>;
}

/**
 * Represents a collection of loaded plugins and metadata
 */
export interface LoadedPlugins {
  /**
   * The JSON schema contributions loaded
   */
  schemaContributions: Array<Record<string, unknown>>;
  /**
   * The actual Stryker plugins loaded, sorted by type
   */
  pluginsByKind: Map<PluginKind, Array<Plugin<PluginKind>>>;
  /**
   * The import specifiers or full URL paths to the actual plugins
   */
  pluginModulePaths: string[];
}

/**
 * Can resolve modules and pull them into memory
 */
export class PluginLoader {
  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  /**
   * Loads plugins based on configured plugin descriptors.
   * A plugin descriptor can be:
   *  * A full url: "file:///home/nicojs/github/my-plugin.js"
   *  * An absolute file path: "/home/nicojs/github/my-plugin.js"
   *  * A relative path: "./my-plugin.js"
   *  * A bare import expression: "@stryker-mutator/karma-runner"
   *  * A simple glob expression (only wild cards are supported): "@stryker-mutator/*"
   */
  public async load(
    pluginDescriptors: readonly string[],
  ): Promise<LoadedPlugins> {
    const pluginModules = await this.resolvePluginModules(pluginDescriptors);
    const loadedPluginModules = (
      await Promise.all(
        pluginModules.map(async (moduleName) => {
          const plugin = await this.loadPlugin(moduleName);
          return {
            ...plugin,
            moduleName,
          };
        }),
      )
    ).filter(notEmpty);

    const result: LoadedPlugins = {
      schemaContributions: [],
      pluginsByKind: new Map<PluginKind, Array<Plugin<PluginKind>>>(),
      pluginModulePaths: [],
    };

    loadedPluginModules.forEach(
      ({ plugins, schemaContribution, moduleName }) => {
        if (plugins) {
          result.pluginModulePaths.push(moduleName);
          plugins.forEach((plugin) => {
            const pluginsForKind = result.pluginsByKind.get(plugin.kind);
            if (pluginsForKind) {
              pluginsForKind.push(plugin);
            } else {
              result.pluginsByKind.set(plugin.kind, [plugin]);
            }
          });
        }
        if (schemaContribution) {
          result.schemaContributions.push(schemaContribution);
        }
      },
    );
    return result;
  }

  private async resolvePluginModules(
    pluginDescriptors: readonly string[],
  ): Promise<string[]> {
    return (
      await Promise.all(
        pluginDescriptors.map(async (pluginExpression) => {
          if (pluginExpression.includes('*')) {
            return await this.globPluginModules(pluginExpression);
          } else if (
            path.isAbsolute(pluginExpression) ||
            pluginExpression.startsWith('.')
          ) {
            return pathToFileURL(path.resolve(pluginExpression)).toString();
          } else {
            // Bare plugin expression like "@stryker-mutator/mocha-runner" (or file URL)
            return pluginExpression;
          }
        }),
      )
    )
      .filter(notEmpty)
      .flat();
  }

  private async globPluginModules(pluginExpression: string) {
    const { org, pkg } = parsePluginExpression(pluginExpression);

    const pluginDirectory = path.resolve(
      fileURLToPath(new URL('../../../../../', import.meta.url)),
      org,
    );
    const regexp = new RegExp('^' + pkg.replace('*', '.*'));
    this.log.debug('Loading %s from %s', pluginExpression, pluginDirectory);
    const plugins = (await fs.promises.readdir(pluginDirectory))
      .filter(
        (pluginName) =>
          !IGNORED_PACKAGES.includes(pluginName) && regexp.test(pluginName),
      )
      .map((pluginName) => `${org.length ? `${org}/` : ''}${pluginName}`);
    if (
      plugins.length === 0 &&
      !defaultOptions.plugins.includes(pluginExpression)
    ) {
      this.log.warn(
        'Expression "%s" not resulted in plugins to load.',
        pluginExpression,
      );
    }
    plugins.forEach((plugin) =>
      this.log.debug(
        'Loading plugin "%s" (matched with expression %s)',
        plugin,
        pluginExpression,
      ),
    );
    return plugins;
  }

  private async loadPlugin(descriptor: string): Promise<
    | {
        plugins: Array<Plugin<PluginKind>> | undefined;
        schemaContribution: Record<string, unknown> | undefined;
      }
    | undefined
  > {
    this.log.debug('Loading plugin %s', descriptor);
    try {
      const module = await fileUtils.importModule(descriptor);
      const plugins = isPluginModule(module)
        ? module.strykerPlugins
        : undefined;
      const schemaContribution = hasValidationSchemaContribution(module)
        ? module.strykerValidationSchema
        : undefined;
      if (plugins ?? schemaContribution) {
        return {
          plugins,
          schemaContribution,
        };
      } else {
        this.log.warn(
          'Module "%s" did not contribute a StrykerJS plugin. It didn\'t export a "%s" or "%s".',
          descriptor,
          propertyPath<PluginModule>()('strykerPlugins'),
          propertyPath<SchemaValidationContribution>()(
            'strykerValidationSchema',
          ),
        );
      }
    } catch (e: any) {
      if (
        e.code === 'ERR_MODULE_NOT_FOUND' &&
        e.message.indexOf(descriptor) !== -1
      ) {
        this.log.warn(
          'Cannot find plugin "%s".\n  Did you forget to install it ?',
          descriptor,
        );
      } else {
        this.log.warn(
          'Error during loading "%s" plugin:\n  %s',
          descriptor,
          e.message,
        );
      }
    }
    return;
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

function isPluginModule(module: unknown): module is PluginModule {
  const pluginModule = module as Partial<PluginModule>;
  return Array.isArray(pluginModule.strykerPlugins);
}

function hasValidationSchemaContribution(
  module: unknown,
): module is SchemaValidationContribution {
  const pluginModule = module as Partial<SchemaValidationContribution>;
  return typeof pluginModule.strykerValidationSchema === 'object';
}
