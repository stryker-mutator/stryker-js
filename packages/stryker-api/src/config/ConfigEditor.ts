import Config from './Config';

interface ConfigEditor {
  write(config: Config): void;
}

export default ConfigEditor;