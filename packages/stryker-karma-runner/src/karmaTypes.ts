import * as karma from 'karma';

declare module 'karma' {
  interface Config extends karma.ConfigOptions { }

  interface ConfigOptions {
    configFile?: string;
    detached?: boolean;
  }

  interface Reporter {
    adapters: any[];
  }
}
