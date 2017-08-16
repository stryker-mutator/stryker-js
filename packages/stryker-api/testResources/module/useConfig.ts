import {Config, ConfigEditor, ConfigEditorFactory} from 'stryker-api/config';

let config: Config = new Config();

class MyConfigEditor {
  constructor() {
  }

  write(config: Config) {
    config.set({ 'myConfig': true });
  }
}

ConfigEditorFactory.instance().register('myConfigEditor', MyConfigEditor);
let myConfigEditor = ConfigEditorFactory.instance().create('myConfigEditor', undefined);
myConfigEditor.write(config);
console.log(config);