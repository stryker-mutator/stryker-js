import * as fs from 'fs';
import * as path from 'path';
import * as log4js from 'log4js';
import * as _ from 'lodash';
import {importModule} from './utils/fileUtils'

let log = log4js.getLogger('PluginLoader');

var IGNORED_PACKAGES = ['stryker-cli'];

export default class PluginLoader {

  constructor(private plugins: string[]) { }

  public load() {
    this.getModules().forEach(this.requirePlugin);
  }

  private getModules() {
    let modules: string[] = [];
    this.plugins.forEach(function (plugin) {
      if (_.isString(plugin)) {
        if (plugin.indexOf('*') !== -1) {
          var pluginDirectory = path.normalize(__dirname + '/../../..');
          var regexp = new RegExp('^' + plugin.replace('*', '.*'));

          log.debug('Loading %s from %s', plugin, pluginDirectory);
          let plugins = fs.readdirSync(pluginDirectory)
            .filter(pluginName => IGNORED_PACKAGES.indexOf(pluginName) === -1 && regexp.test(pluginName))
            .map(pluginName => pluginDirectory + '/' + pluginName);
          if (plugins.length === 0) {
            log.debug('Expression %s not resulted in plugins to load', plugin);
          } else {
            log.debug('Expression %s resulted in plugins: %s', plugin, plugins);
          }
          plugins
            .forEach(p => modules.push(p));
        } else {
          modules.push(plugin);
        }
      } else {
        log.warn('Ignoring plugin %s, as its not a string type', plugin)
      }
    });

    return modules
  }

  private requirePlugin(name: string) {
    log.debug(`Loading plugins ${name}`);
    try {
      importModule(name);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
        log.warn('Cannot find plugin "%s".\n  Did you forget to install it ?\n' +
          '  npm install %s --save-dev', name, name)
      } else {
        log.warn('Error during loading "%s" plugin:\n  %s', name, e.message)
      }
    }
  }
}
