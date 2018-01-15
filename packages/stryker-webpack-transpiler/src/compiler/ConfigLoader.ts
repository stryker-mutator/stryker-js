import * as path from 'path';
import { Configuration } from 'webpack';


export default class ConfigLoader {
  public constructor(private loader: NodeRequireFunction = require) {
  }

  public load(webpackConfigLocation: string): Configuration {
      return this.loader(path.resolve(webpackConfigLocation));
  }
}
