import {Config, ConfigEditor, ConfigEditorFactory} from 'stryker-api/config';

let config: Config = new Config();

class MyConfigEditor {
  constructor() {
  }

  edit(config: Config) {
    config.set({ 'myConfig': true });
  }
}

ConfigEditorFactory.instance().register('myConfigEditor', MyConfigEditor);
let myConfigEditor = ConfigEditorFactory.instance().create('myConfigEditor', undefined);
myConfigEditor.edit(config);
console.log(config);