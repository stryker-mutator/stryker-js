import {Config, ConfigWriter, ConfigWriterFactory} from 'stryker-api/config';

let config: Config = new Config();

class MyConfigWriter {
  constructor() {
  }

  write(config: Config) {
    config.set({ 'myConfig': true });
  }
}

ConfigWriterFactory.instance().register('myConfigWriter', MyConfigWriter);
let myConfigWriter = ConfigWriterFactory.instance().create('myConfigWriter', undefined);
myConfigWriter.write(config);
console.log(config);