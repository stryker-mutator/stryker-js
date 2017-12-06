import * as os from 'os';
import { File, TextFile, FileKind } from 'stryker-api/core';
import { CONFIG_KEY_OPTIONS, CONFIG_KEY_FILE } from './keys';
import { Config } from 'stryker-api/config';
import * as ts from 'typescript';
import * as path from 'path';
import * as semver from 'semver';

export function createProgram(inputFiles: File[], strykerConfig: Config) {
  const files = inputFiles
    .filter(file => file.kind === FileKind.Text)
    .map(file => file.name);
  const options = getTSConfig(strykerConfig);

  return ts.createProgram(files, options || {});
}

export function parseFile(file: TextFile, target: ts.ScriptTarget | undefined) {
  return ts.createSourceFile(
    file.name,
    file.content,
    target || ts.ScriptTarget.ES5,
    /*setParentNodes*/ true);
}

export function getTSConfig(strykerConfig: Config): ts.CompilerOptions | undefined {
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

/**
 * Verifies that the installed version of typescript satisfies '>=2.4` and otherwise: throws an exception
 */
export function guardTypescriptVersion() {
  if (!semver.satisfies(ts.version, '>=2.4')) {
    throw new Error(`Installed typescript version ${ts.version} is not supported by stryker-typescript. Please install version 2.5 or higher (\`npm install typescript@^2.5\`).`);
  }
}


const printer = ts.createPrinter({
  removeComments: false,
  newLine: os.EOL === '\r\n' ? ts.NewLineKind.CarriageReturnLineFeed : ts.NewLineKind.LineFeed
});

export function printNode(node: ts.Node, originalSourceFile: ts.SourceFile): string {
  return printer.printNode(ts.EmitHint.Unspecified, node, originalSourceFile);
}

function tsExtensions() {
  // Since ts 2.5 the ts.Extension enum is a string-based enum 
  if (semver.satisfies(ts.version, '>=2.5')) {
    return Object.keys(ts.Extension).map(extension => ts.Extension[extension as any]);
  } else {
    // We know that pre 2.5 should have these extensions:
    return ['.ts', '.tsx', '.js', '.jsx'];
  }
}


export function isTypescriptFile(file: File) {
  return file.kind === FileKind.Text &&
    tsExtensions().some(extension => file.name.endsWith(extension));
}

/**
 * Determines whether or not given file is a typescript header file (*.d.ts)
 */
export function isHeaderFile(file: File) {
  return file.name.endsWith('.d.ts');
}

/**
 * Returns all the files that are considered typescript files (text files with *.ts or something like that)
 */
export function filterTypescriptFiles(files: File[]): TextFile[] {
  return files.filter(isTypescriptFile) as TextFile[];
}

/**
 * Returns all items that are NOT undefined or null
 */
export function filterNotEmpty<T>(input: (T | undefined | null)[]): T[] {
  return input.filter(item => item !== void 0 && item !== null) as T[];
}