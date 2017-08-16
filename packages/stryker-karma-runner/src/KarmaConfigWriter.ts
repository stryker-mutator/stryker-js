import * as log4js from 'log4js';
import * as karma from 'karma';
import { InputFileDescriptor } from 'stryker-api/core';
import { ConfigEditor, Config as StrykerConfig } from 'stryker-api/config';
import KarmaConfigReader from './KarmaConfigReader';

const log = log4js.getLogger('KarmaConfigWriter');

export default class KarmaConfigWriter implements ConfigEditor {
  write(strykerConfig: StrykerConfig) {
    const karmaConfig = new KarmaConfigReader(strykerConfig['karmaConfigFile']).read();
    if (karmaConfig) {
      KarmaConfigWriter.importFiles(strykerConfig, karmaConfig);
      KarmaConfigWriter.importDefaultKarmaConfig(strykerConfig, karmaConfig);
    }
  }

  private static importFiles(strykerConfig: StrykerConfig, karmaConfig: karma.ConfigOptions) {
    if (!strykerConfig.files) { strykerConfig.files = []; }
    if (!karmaConfig.files) { karmaConfig.files = []; }
    if (!karmaConfig.exclude) { karmaConfig.exclude = []; }

    const files: (karma.FilePattern | string)[] = karmaConfig.files;
    const exclude: string[] = karmaConfig.exclude;
    if (files && Array.isArray(files)) {
      const karmaFiles = files.map(KarmaConfigWriter.toInputFileDescriptor);
      log.debug(`Importing following files from karma.conf file to stryker: ${JSON.stringify(karmaFiles)}`);
      strykerConfig.files = strykerConfig.files.concat(karmaFiles);
    }
    if (exclude && Array.isArray(exclude)) {
      const ignores = exclude.map(fileToIgnore => `!${fileToIgnore}`);
      log.debug(`Importing following "exclude" files from karma configuration: ${JSON.stringify(ignores)}`);
      strykerConfig.files = strykerConfig.files.concat(ignores);
    }
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