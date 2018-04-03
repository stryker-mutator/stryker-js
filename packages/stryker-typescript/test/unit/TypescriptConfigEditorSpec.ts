import * as fs from 'fs';
import * as path from 'path';
import * as log4js from 'log4js';
import * as ts from 'typescript';
import { expect } from 'chai';
import { SinonStub, match } from 'sinon';
import { Config } from 'stryker-api/config';
import TypescriptConfigEditor from './../../src/TypescriptConfigEditor';

const CONFIG_KEY = 'tsconfigFile';

describe('TypescriptConfigEditor edit', () => {

  let readFileSyncStub: SinonStub;
  let loggerStub: {
    debug: SinonStub;
    info: SinonStub;
    error: SinonStub;
  };
  let config: Config;
  let sut: TypescriptConfigEditor;

  beforeEach(() => {
    readFileSyncStub = sandbox.stub(fs, 'readFileSync');
    loggerStub = {
      debug: sandbox.stub(),
      info: sandbox.stub(),
      error: sandbox.stub()
    };
    sandbox.stub(log4js, 'getLogger').returns(loggerStub);
    config = new Config();
    sut = new TypescriptConfigEditor();
  });

  it('should not load any config if "tsconfigFile" is not specified', () => {
    sut.edit(config);
    expect(config[CONFIG_KEY]).undefined;
    expect(loggerStub.debug).calledWith('No \'%s\' specified, not loading any config', CONFIG_KEY);
  });

  it('should load the given tsconfig file', () => {
    config[CONFIG_KEY] = 'tsconfig.json';
    readFileSyncStub.returns(`{
      "compilerOptions": {
        "module": "commonjs",
        "noImplicitAny": true,
        "removeComments": true,
        "preserveConstEnums": true,
        "sourceMap": true
      },
      "exclude": [
          "node_modules",
          "src/**/*.d.ts",
          "test/**/*.d.ts",
          "testResources"
      ]
  }`);
    sut.edit(config, parseConfigHost());
    expect(fs.readFileSync).calledWith(path.resolve('tsconfig.json'));
    expect(config['tsconfig'].options).include({
      module: ts.ModuleKind.CommonJS,
      configFilePath: path.resolve('tsconfig.json').replace(/\\/g, '/'),
      project: path.resolve('.').replace(/\\/g, '/'),
      noImplicitAny: true,
      removeComments: true,
      preserveConstEnums: true,
      sourceMap: true
    });
    expect(config['tsconfig'].fileNames).deep.eq(['file1.ts', 'file2.ts']);
  });

  it('should override quality options', () => {
    config[CONFIG_KEY] = 'tsconfig.json';
    readFileSyncStub.returns(`{
      "compilerOptions": {
        "allowUnreachableCode": false,
        "noUnusedLocals": true,
        "noUnusedParameters": true
       }
  }`);
    sut.edit(config, parseConfigHost());
    expect(config['tsconfig'].options).include({
      allowUnreachableCode: true,
      noUnusedLocals: false,
      noUnusedParameters: false
    });
  });

  it('should log errors on failure during load', () => {
    readFileSyncStub.returns(`invalid json`);
    config[CONFIG_KEY] = 'tsconfig.json';
    expect(() => sut.edit(config)).throws('error TS1005: \'{\' expected.');
  });

  it('should log errors on failure during load of extending file', () => {
    readFileSyncStub.returns(`{ "extends": "./parent.tsconfig.json" }`);
    config[CONFIG_KEY] = 'tsconfig.json';
    sut.edit(config, parseConfigHost({ readFile: _ => `invalid json` }));
    expect(loggerStub.error).calledWithMatch(match('error TS1005: \'{\' expected.'));
  });

  function parseConfigHost(overrides?: Partial<ts.ParseConfigHost>): ts.ParseConfigHost {
    const defaults: ts.ParseConfigHost = {
      useCaseSensitiveFileNames: true,
      readDirectory: dir => ['file1.ts', 'file2.ts'],
      fileExists: _ => true,
      readFile: _ => ''
    };
    return Object.assign({}, defaults, overrides);
  }
});