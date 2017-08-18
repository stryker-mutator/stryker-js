import { CONFIG_KEY_OPTIONS, CONFIG_KEY_FILE } from './keys';
import { Config } from 'stryker-api/config';
import * as ts from 'typescript';
import { InputFile } from 'stryker-api/core';
import * as path from 'path';

export function createProgram(inputFiles: InputFile[], strykerConfig: Config) {
  return ts.createProgram(inputFiles.map(file => file.path), strykerConfig[CONFIG_KEY_OPTIONS]);
}

export function getCompilerOptions(config: Config) {
  return config[CONFIG_KEY_OPTIONS];
}

export function getProjectDirectory(config: Config) {
  return path.dirname(config[CONFIG_KEY_FILE] || '.');
}