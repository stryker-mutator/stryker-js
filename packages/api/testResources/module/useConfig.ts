import {Config, ConfigEditor } from '@stryker-mutator/api/config';

const config: Config = new Config();

class MyConfigEditor implements ConfigEditor {
  public edit(config: Config) {
    config.set({ myConfig: true });
  }
}

new MyConfigEditor().edit(config);
console.log(config);
