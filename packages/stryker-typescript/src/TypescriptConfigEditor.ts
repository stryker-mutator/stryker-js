import * as os from 'os';
import * as path from 'path';
import * as ts from 'typescript';
import { getLogger, setGlobalLogLevel } from 'log4js';
import { ConfigEditor, Config } from 'stryker-api/config';
import { CONFIG_KEY_FILE, CONFIG_KEY } from './helpers/keys';
import * as fs from 'fs';
import { normalizeFileForTypescript, normalizeFileFromTypescript } from './helpers/tsHelpers';

// Override some compiler options that have to do with code quality. When mutating, we're not interested in the resulting code quality
// See https://github.com/stryker-mutator/stryker/issues/391 for more info
const COMPILER_OPTIONS_OVERRIDES: Readonly<Partial<ts.CompilerOptions>> = Object.freeze({
  allowUnreachableCode: true,
  noUnusedLocals: false,
  noUnusedParameters: false
});

export default class TypescriptConfigEditor implements ConfigEditor {

  private log = getLogger(TypescriptConfigEditor.name);

  edit(strykerConfig: Config, host: ts.ParseConfigHost = ts.sys) {
    setGlobalLogLevel(strykerConfig.logLevel);
    this.loadTSConfig(strykerConfig, host);
  }

  private loadTSConfig(strykerConfig: Config, host: ts.ParseConfigHost) {
    if (typeof strykerConfig[CONFIG_KEY_FILE] === 'string') {
      const tsconfigFileName = path.resolve(strykerConfig[CONFIG_KEY_FILE]);
      this.log.info(`Loading tsconfig file ${tsconfigFileName}`);
      const tsconfig = this.readTypescriptConfig(tsconfigFileName, host);
      if (tsconfig) {
        strykerConfig[CONFIG_KEY] = this.overrideOptions(tsconfig);
      }
    } else {
      this.log.debug('No \'%s\' specified, not loading any config', CONFIG_KEY_FILE);
    }
  }

  private overrideOptions(tsConfig: ts.ParsedCommandLine): ts.ParsedCommandLine {
    tsConfig.options = Object.assign({}, tsConfig.options, COMPILER_OPTIONS_OVERRIDES);
    tsConfig.fileNames = tsConfig.fileNames.map(normalizeFileFromTypescript);
    return tsConfig;
  }


  private readTypescriptConfig(tsconfigFileName: string, host: ts.ParseConfigHost) {
    const configFileBase = normalizeFileForTypescript(path.dirname(tsconfigFileName));
    const configFileText = fs.readFileSync(tsconfigFileName, 'utf8');
    const tsconfigFileNameNormalizedForTypeScript = normalizeFileForTypescript(tsconfigFileName);
    const parseResult = ts.parseConfigFileTextToJson(tsconfigFileNameNormalizedForTypeScript, configFileText);
    if (parseResult.error) {
      const error = ts.formatDiagnostics([parseResult.error], diagnosticsHost(configFileBase));
      throw new Error(`Error while loading tsconfig file '${tsconfigFileName}': ${error}`);
    } else {
      const tsconfig = ts.parseJsonConfigFileContent(
        parseResult.config,
        host,
        configFileBase,
        { project: configFileBase },
        tsconfigFileNameNormalizedForTypeScript);
      if (tsconfig.errors.length) {
        const error = ts.formatDiagnostics(tsconfig.errors, diagnosticsHost(configFileBase));
        this.log.error(`Error while loading tsconfig file '${tsconfigFileName}': ${error}`);
      }
      return tsconfig;
    }

    function diagnosticsHost(configFileBase: string): ts.FormatDiagnosticsHost {
      return {
        getCurrentDirectory: () => configFileBase,
        getCanonicalFileName: (fileName) => path.resolve(fileName),
        getNewLine: () => os.EOL
      };
    }
  }
}
