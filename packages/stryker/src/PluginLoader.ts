import * as fs from 'mz/fs';
import * as path from 'path';
import { getLogger } from 'stryker-api/logging';
import * as _ from 'lodash';
import { importModule } from './utils/fileUtils';

const IGNORED_PACKAGES = ['stryker-cli', 'stryker-api'];

export default class PluginLoader {
  private readonly log = getLogger(PluginLoader.name);
  constructor(private readonly plugins: string[]) { }

  public load() {
    this.getModules().forEach(moduleName => this.requirePlugin(moduleName));
  }

  private getModules() {
    const modules: string[] = [];
    this.plugins.forEach(pluginExpression => {
      if (_.isString(pluginExpression)) {
        if (pluginExpression.indexOf('*') !== -1) {

          // Plugin directory is the node_modules folder of the module that installed stryker
          // So if current __dirname is './stryker/src' than the plugin directory should be 2 directories above
          const pluginDirectory = path.normalize(__dirname + '/../..');
          const regexp = new RegExp('^' + pluginExpression.replace('*', '.*'));

          this.log.debug('Loading %s from %s', pluginExpression, pluginDirectory);
          const plugins = fs.readdirSync(pluginDirectory)
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
      importModule(name);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
        this.log.warn('Cannot find plugin "%s".\n  Did you forget to install it ?\n' +
          '  npm install %s --save-dev', name, name);
      } else {
        this.log.warn('Error during loading "%s" plugin:\n  %s', name, e.message);
      }
    }
  }
}
