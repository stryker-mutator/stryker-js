import * as os from 'os';
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

const printer = ts.createPrinter({
  removeComments: false,
  newLine: os.EOL === '\r\n' ? ts.NewLineKind.CarriageReturnLineFeed : ts.NewLineKind.LineFeed
});

export function printNode(node: ts.Node, originalSourceFile: ts.SourceFile): string {
  return printer.printNode(ts.EmitHint.Unspecified, node, originalSourceFile);
}

const allExtensions: string[] = Object.keys(ts.Extension).map(extension => ts.Extension[extension as any]);
export function isToBeTranspiled(file: File) {
  return file.kind === FileKind.Text &&
    file.transpiled &&
    allExtensions.some(extension => file.name.endsWith(extension)) && !file.name.endsWith('.d.ts');
}


export function filterOutTypescriptFiles(files: File[]): TextFile[] {
  return files.filter(isToBeTranspiled) as TextFile[];
}

export function filterEmpty<T>(input: (T | undefined | null)[]): T[] {
  return input.filter(item => item !== void 0 && item !== null) as T[];
}