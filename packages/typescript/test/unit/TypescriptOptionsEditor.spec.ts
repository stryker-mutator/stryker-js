import * as fs from 'fs';
import * as path from 'path';

import sinon = require('sinon');
import { expect } from 'chai';
import * as ts from 'typescript';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { match, SinonStub } from 'sinon';

import { TypescriptWithStrykerOptions } from '../../src/TypescriptWithStrykerOptions';

import TypescriptOptionsEditor from './../../src/TypescriptOptionsEditor';

describe(TypescriptOptionsEditor.name, () => {
  let readFileSyncStub: SinonStub;
  let options: TypescriptWithStrykerOptions;
  let sut: TypescriptOptionsEditor;

  beforeEach(() => {
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    options = factory.strykerOptions();
    sut = testInjector.injector.injectClass(TypescriptOptionsEditor);
  });

  it('should not load any config if "tsconfigFile" is not specified', () => {
    sut.edit(options);
    expect(options.tsconfigFile).undefined;
    expect(testInjector.logger.debug).calledWith("No '%s' specified, not loading any config", 'tsconfigFile');
  });

  it('should load the given tsconfig file', () => {
    options.tsconfigFile = 'tsconfig.json';
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
    sut.edit(options, parseConfigHost());
    expect(fs.readFileSync).calledWith(path.resolve('tsconfig.json'));
    expect(options.tsconfig!.options).include({
      configFilePath: path.resolve('tsconfig.json').replace(/\\/g, '/'),
      module: ts.ModuleKind.CommonJS,
      noImplicitAny: true,
      preserveConstEnums: true,
      project: path.resolve('.').replace(/\\/g, '/'),
      removeComments: true,
      sourceMap: true
    });
    expect(options.tsconfig!.fileNames).deep.eq(['file1.ts', 'file2.ts']);
  });

  it('should override quality options', () => {
    options.tsconfigFile = 'tsconfig.json';
    readFileSyncStub.returns(`{
      "compilerOptions": {
        "allowUnreachableCode": false,
        "noUnusedLocals": true,
        "noUnusedParameters": true
       }
  }`);
    sut.edit(options, parseConfigHost());
    expect(options.tsconfig!.options).include({
      allowUnreachableCode: true,
      noUnusedLocals: false,
      noUnusedParameters: false
    });
  });

  it('should log errors on failure during load', () => {
    readFileSyncStub.returns('invalid json');
    options.tsconfigFile = 'tsconfig.json';
    expect(() => sut.edit(options)).throws("error TS1005: '{' expected.");
  });

  it('should log errors on failure during load of extending file', () => {
    readFileSyncStub.returns('{ "extends": "./parent.tsconfig.json" }');
    options.tsconfigFile = 'tsconfig.json';
    sut.edit(options, parseConfigHost({ readFile: () => 'invalid json' }));
    expect(testInjector.logger.error).calledWithMatch(match("error TS1005: '{' expected."));
  });

  function parseConfigHost(overrides?: Partial<ts.ParseConfigHost>): ts.ParseConfigHost {
    const defaults: ts.ParseConfigHost = {
      fileExists: () => true,
      readDirectory: () => ['file1.ts', 'file2.ts'],
      readFile: () => '',
      useCaseSensitiveFileNames: true
    };
    return Object.assign({}, defaults, overrides);
  }
});
