import {Config, ConfigEditor, ConfigEditorFactory} from '@stryker-mutator/api/config';

const config: Config = new Config();

class MyConfigEditor {
  constructor() { }

  public edit(config: Config) {
    config.set({ myConfig: true });
  }
}

ConfigEditorFactory.instance().register('myConfigEditor', MyConfigEditor);
const myConfigEditor = ConfigEditorFactory.instance().create('myConfigEditor', undefined);
myConfigEditor.edit(config);
console.log(config);
