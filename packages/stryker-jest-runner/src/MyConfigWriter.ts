import { ConfigWriter, Config } from 'stryker-api/config';

export default class MyConfigWriter implements ConfigWriter {
  
  write(config: Config): void { }

}