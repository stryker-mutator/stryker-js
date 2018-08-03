import * as karma from 'karma';

declare module 'karma' {
  interface Config extends karma.ConfigOptions {
    set: (config: Partial<karma.ConfigOptions>) => void;
  }

  interface ConfigOptions {
    detached?: boolean;
    configFile?: string;
  }

  interface Reporter {
    adapters: any[];
  }
}