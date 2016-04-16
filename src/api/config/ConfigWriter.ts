import Config from './Config';

interface ConfigWriter {
  write(config: Config): void;
}

export default ConfigWriter;