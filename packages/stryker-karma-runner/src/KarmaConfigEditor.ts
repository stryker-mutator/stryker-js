import * as log4js from 'log4js';
import * as karma from 'karma';
import { InputFileDescriptor } from 'stryker-api/core';
import { ConfigEditor, Config as StrykerConfig } from 'stryker-api/config';
import KarmaConfigReader from './KarmaConfigReader';

const log = log4js.getLogger('KarmaConfigEditor');

export default class KarmaConfigEditor implements ConfigEditor {
  edit(strykerConfig: StrykerConfig) {
    // Copy logLevel to local logLevel
    log4js.setGlobalLogLevel(strykerConfig.logLevel);

    const karmaConfig = new KarmaConfigReader(strykerConfig['karmaConfigFile']).read();
    if (karmaConfig) {
      KarmaConfigEditor.importFiles(strykerConfig, karmaConfig);
      KarmaConfigEditor.importDefaultKarmaConfig(strykerConfig, karmaConfig);
    }
  }

  private static importFiles(strykerConfig: StrykerConfig, karmaConfig: karma.ConfigOptions) {
    if (!strykerConfig.files) { strykerConfig.files = []; }
    if (!Array.isArray(karmaConfig.files)) { karmaConfig.files = []; }
    if (!Array.isArray(karmaConfig.exclude)) { karmaConfig.exclude = []; }

    const files: (karma.FilePattern | string)[] = karmaConfig.files;
    const exclude: string[] = karmaConfig.exclude;
    const karmaFiles: Array<InputFileDescriptor | string> = files.map(KarmaConfigEditor.toInputFileDescriptor);
    const ignores = exclude.map(fileToIgnore => `!${fileToIgnore}`);
    ignores.forEach(ignore => karmaFiles.push(ignore));
    if (karmaFiles.length) {
      log.debug(`Importing following files from karma.conf file to stryker: ${JSON.stringify(karmaFiles)}`);
    } else {
      log.debug(`Importing no files from karma.conf file`);
    }
    strykerConfig.files = karmaFiles.concat(strykerConfig.files);
  }

  private static importDefaultKarmaConfig(strykerConfig: StrykerConfig, karmaConfig: karma.ConfigOptions) {
    if (strykerConfig['karmaConfig']) {
      const target = strykerConfig['karmaConfig'];
      for (let i in karmaConfig) {
        if (!target[i]) {
          target[i] = (<any>karmaConfig)[i];
        }
      }
    } else {
      strykerConfig['karmaConfig'] = karmaConfig;
    }
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