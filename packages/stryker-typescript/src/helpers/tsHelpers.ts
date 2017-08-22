import { File, TextFile } from 'stryker-api/core';
import { CONFIG_KEY_OPTIONS, CONFIG_KEY_FILE } from './keys';
import { Config } from 'stryker-api/config';
import * as ts from 'typescript';
import * as path from 'path';

export function createProgram(inputFiles: File[], strykerConfig: Config) {
  return ts.createProgram(inputFiles.map(file => file.name), getTSConfig(strykerConfig));
}

export function getTSConfig(strykerConfig: Config): ts.CompilerOptions {
  return strykerConfig[CONFIG_KEY_OPTIONS];
}

export function getCompilerOptions(config: Config) {
  return config[CONFIG_KEY_OPTIONS];
}

export function getProjectDirectory(config: Config) {
  return path.dirname(config[CONFIG_KEY_FILE] || '.');
}

const allExtensions: string[] = Object.keys(ts.Extension).map(extension => ts.Extension[extension as any]);
export function isTypescriptFile(file: File) {
  return allExtensions.some(extension => file.name.endsWith(extension));
}

export function isTextFile(file: File): file is TextFile {
  return typeof file.content === 'string';
}

export function filterOutTypescriptFiles(files: File[]) {
  const typescriptFiles: TextFile[] = [];
  const otherFiles: File[] = [];
  files.forEach(file => {
    if (isTypescriptFile(file) && isTextFile(file)) {
      typescriptFiles.push(file);
    } else {
      otherFiles.push(file);
    }
  });
  return { typescriptFiles, otherFiles };
}
