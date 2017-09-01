import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as ts from 'typescript';
import { getLogger } from 'log4js';
import { ConfigEditor, Config } from 'stryker-api/config';
import { CONFIG_KEY_FILE, CONFIG_KEY_OPTIONS } from './helpers/keys';
import { normalizeForTypescript } from './helpers/tsHelpers';

export default class TypescriptConfigEditor implements ConfigEditor {

  private log = getLogger(TypescriptConfigEditor.name);

  edit(strykerConfig: Config, host: ts.ParseConfigHost = ts.sys) {
    if (typeof strykerConfig[CONFIG_KEY_FILE] === 'string') {
      const tsconfigFileName = path.resolve(strykerConfig[CONFIG_KEY_FILE]);
      this.log.info(`Loading tsconfig file ${tsconfigFileName}`);
      const tsconfig = this.readTypescriptConfig(tsconfigFileName, host);
      if (tsconfig) {
        if (!strykerConfig.files) {
          strykerConfig.files = [];
        }
        // add the files to the beginning. That way they can still be excluded by the user
        strykerConfig.files.unshift(...tsconfig.fileNames); 
        strykerConfig[CONFIG_KEY_OPTIONS] = tsconfig.options;
      }
    } else {
      this.log.debug('No \'%s\' specified, not loading any config', CONFIG_KEY_FILE);
    }
  }

  private readTypescriptConfig(tsconfigFileName: string, host: ts.ParseConfigHost) {
    const configFileBase = normalizeForTypescript(path.dirname(tsconfigFileName));
    const configFileText = fs.readFileSync(tsconfigFileName, 'utf8');
    const tsconfigFileNameNormalizedForTypeScript = normalizeForTypescript(tsconfigFileName);
    const parseResult = ts.parseConfigFileTextToJson(tsconfigFileNameNormalizedForTypeScript, configFileText);
    if (parseResult.error) {
      const error = ts.formatDiagnostics([parseResult.error], this.diagnosticsHost(configFileBase));
      this.log.error(`Error while loading tsconfig file '${tsconfigFileName}': ${error}`);
      return null;
    } else {
      const tsconfig = ts.parseJsonConfigFileContent(
        parseResult.config,
        host,
        configFileBase,
        { project: configFileBase },
        tsconfigFileNameNormalizedForTypeScript);
      if (tsconfig.errors.length) {
        const error = ts.formatDiagnostics(tsconfig.errors, this.diagnosticsHost(configFileBase));
        this.log.error(`Error while loading tsconfig file '${tsconfigFileName}': ${error}`);
      }
      return tsconfig;
    }
  }

  private diagnosticsHost(configFileBase: string): ts.FormatDiagnosticsHost {
    return {
      getCurrentDirectory: () => configFileBase,
      getCanonicalFileName: (fileName) => path.resolve(fileName),
      getNewLine: () => os.EOL
    };
  }
}
