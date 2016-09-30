import * as fs from 'fs';
import * as path from 'path';
import * as log4js from 'log4js';
import * as _ from 'lodash';
import { importModule } from './utils/fileUtils';

let log = log4js.getLogger('PluginLoader');

const IGNORED_PACKAGES = ['stryker-cli', 'stryker-api'];

export default class PluginLoader {

  constructor(private plugins: string[]) { }

  public load() {
    this.getModules().forEach(this.requirePlugin);
  }

  private getModules() {
    let modules: string[] = [];
    this.plugins.forEach(function (pluginExpression) {
      if (_.isString(pluginExpression)) {
        if (pluginExpression.indexOf('*') !== -1) {

          // Plugin directory is the node_modules folder of the module that installed stryker
          // So if current __dirname is './stryker/src' than the plugin directory should be 2 directories above
          const pluginDirectory = path.normalize(__dirname + '/../..');
          const regexp = new RegExp('^' + pluginExpression.replace('*', '.*'));

          log.debug('Loading %s from %s', pluginExpression, pluginDirectory);
          let plugins = fs.readdirSync(pluginDirectory)
            .filter(pluginName => IGNORED_PACKAGES.indexOf(pluginName) === -1 && regexp.test(pluginName))
            .map(pluginName => pluginDirectory + '/' + pluginName);
          if (plugins.length === 0) {
            log.debug('Expression %s not resulted in plugins to load', pluginExpression);
          }
          plugins
            .map(plugin => path.basename(plugin))
            .map(plugin => {
              log.debug('Loading plugins %s (matched with expression %s)', plugin, pluginExpression);
              return plugin;
            })
            .forEach(p => modules.push(p));
        } else {
          modules.push(pluginExpression);
        }
      } else {
        log.warn('Ignoring plugin %s, as its not a string type', pluginExpression);
      }
    });

    return modules;
  }

  private requirePlugin(name: string) {
    log.debug(`Loading plugins ${name}`);
    try {
      importModule(name);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
        log.warn('Cannot find plugin "%s".\n  Did you forget to install it ?\n' +
          '  npm install %s --save-dev', name, name);
      } else {
        log.warn('Error during loading "%s" plugin:\n  %s', name, e.message);
      }
    }
  }
}
