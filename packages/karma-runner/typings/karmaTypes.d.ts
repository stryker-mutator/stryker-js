import * as karma from 'karma';
declare module 'karma' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Config extends karma.ConfigOptions {}
  interface ConfigOptions {
    detached?: boolean;
    configFile?: string;
  }
  interface Reporter {
    adapters: any[];
  }
}
//# sourceMappingURL=karmaTypes.d.ts.map
