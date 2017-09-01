import { File, TextFile, FileKind } from 'stryker-api/core';
import { CONFIG_KEY_OPTIONS, CONFIG_KEY_FILE } from './keys';
import { Config } from 'stryker-api/config';
import * as ts from 'typescript';
import * as path from 'path';

export function createProgram(inputFiles: File[], strykerConfig: Config) {
  const files = inputFiles
    .filter(file => file.kind === FileKind.Text)
    .map(file => file.name);
  const options = getTSConfig(strykerConfig);

  return ts.createProgram(files, options);
}

export function getTSConfig(strykerConfig: Config): ts.CompilerOptions {
  return strykerConfig[CONFIG_KEY_OPTIONS];
}

/**
 * For some reason, typescript on windows doesn't like back slashes
 * @param fileName The file name to be normalized
 */
export function normalizeForTypescript(fileName: string) {
  return fileName.replace(/\\/g, '/');
}

export function getCompilerOptions(config: Config) {
  return config[CONFIG_KEY_OPTIONS];
}

export function getProjectDirectory(config: Config) {
  return path.dirname(config[CONFIG_KEY_FILE] || '.');
}

const allExtensions: string[] = ['ts', 'tsx']; // TODO Object.keys(ts.Extension).map(extension => ts.Extension[extension as any]);
export function isTypescriptFile(file: File) {
  return allExtensions.some(extension => file.name.endsWith(extension)) && !file.name.endsWith('.d.ts');
}


export function filterOutTypescriptFiles(files: File[]) {
  const typescriptFiles: TextFile[] = [];
  const otherFiles: File[] = [];
  files.forEach(file => {
    if (isTypescriptFile(file) && file.kind === FileKind.Text) {
      typescriptFiles.push(file);
    } else {
      otherFiles.push(file);
    }
  });
  return { typescriptFiles, otherFiles };
}
