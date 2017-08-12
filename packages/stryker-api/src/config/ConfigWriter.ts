import Config from './Config';

interface Configurator {
  write(config: Config): void;
}

export default Configurator;