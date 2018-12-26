import { Config, ConfigEditor, ConfigEditorFactory } from 'stryker-api/config';

const config: Config = new Config();

class MyConfigEditor {

  public edit(config: Config) {
    config.set({ myConfig: true });
  }
}

ConfigEditorFactory.instance().register('myConfigEditor', MyConfigEditor);
const myConfigEditor = ConfigEditorFactory.instance().create('myConfigEditor', undefined);
myConfigEditor.edit(config);
console.log(config);
