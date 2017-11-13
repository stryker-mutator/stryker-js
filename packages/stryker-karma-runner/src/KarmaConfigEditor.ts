import * as log4js from 'log4js';
import * as karma from 'karma';
import { InputFileDescriptor } from 'stryker-api/core';
import { ConfigEditor, Config as StrykerConfig } from 'stryker-api/config';
import KarmaConfigReader from './KarmaConfigReader';
import { KARMA_CONFIG, KARMA_CONFIG_FILE } from './configKeys';

export default class KarmaConfigEditor implements ConfigEditor {
  private log = log4js.getLogger(KarmaConfigEditor.name);
  
  edit(strykerConfig: StrykerConfig) {
    // Copy logLevel to local logLevel
    log4js.setGlobalLogLevel(strykerConfig.logLevel);

    const karmaConfig = new KarmaConfigReader(strykerConfig[KARMA_CONFIG_FILE]).read();
    if (karmaConfig) {
      this.importKarmaConfig(strykerConfig, karmaConfig);
      this.importFiles(strykerConfig);
    }
  }

  private importFiles(strykerConfig: StrykerConfig) {
    const karmaConfig: karma.ConfigOptions = strykerConfig[KARMA_CONFIG];
    if (!strykerConfig.files) { strykerConfig.files = []; }
    if (!Array.isArray(karmaConfig.files)) { karmaConfig.files = []; }
    if (!Array.isArray(karmaConfig.exclude)) { karmaConfig.exclude = []; }

    const files: (karma.FilePattern | string)[] = karmaConfig.files;
    const exclude: string[] = karmaConfig.exclude;
    const karmaFiles: Array<InputFileDescriptor | string> = files.map(KarmaConfigEditor.toInputFileDescriptor);
    const ignores = exclude.map(fileToIgnore => `!${fileToIgnore}`);
    ignores.forEach(ignore => karmaFiles.push(ignore));
    if (karmaFiles.length) {
      this.log.debug(`Importing following files from karma.conf file to stryker: ${JSON.stringify(karmaFiles)}`);
    } else {
      this.log.debug(`Importing no files from karma.conf file`);
    }
    strykerConfig.files = karmaFiles.concat(strykerConfig.files);
  }

  private importKarmaConfig(strykerConfig: StrykerConfig, karmaConfig: karma.ConfigOptions) {
    strykerConfig[KARMA_CONFIG] = Object.assign(karmaConfig, strykerConfig[KARMA_CONFIG]);
  }

  private static toInputFileDescriptor(karmaPattern: karma.FilePattern | string): InputFileDescriptor {
    if (typeof karmaPattern === 'string') {
      return {
        pattern: karmaPattern,
        included: true,
        mutated: false
      };
    } else {
      return {
        pattern: karmaPattern.pattern,
        included: karmaPattern.included || false,
        mutated: (karmaPattern as any)['mutated'] || false
      };
    }
  }
}