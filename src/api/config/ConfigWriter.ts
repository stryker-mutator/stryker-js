import Config from './Config';

interface ConfigWriter {
  writer(config: Config): void;
}

export default ConfigWriter;