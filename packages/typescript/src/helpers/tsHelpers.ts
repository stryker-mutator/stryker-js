import { File, StrykerOptions } from '@stryker-mutator/api/core';
import * as os from 'os';
import * as path from 'path';
import * as semver from 'semver';
import * as ts from 'typescript';
import { CONFIG_KEY, CONFIG_KEY_FILE } from './keys';

export function parseFile(file: File, target: ts.ScriptTarget | undefined) {
  return ts.createSourceFile(file.name, file.textContent, target || ts.ScriptTarget.ES5, /*setParentNodes*/ true);
}

/**
 * For some reason, typescript on windows doesn't like back slashes
 * @param fileName The file name to be normalized
 */
export function normalizeFileForTypescript(fileName: string) {
  return fileName.replace(/\\/g, '/');
}

/**
 * For some reason, typescript on windows doesn't like back slashes
 * @param fileName The file name to be normalized
 */
export function normalizeFileFromTypescript(fileName: string) {
  return path.normalize(fileName);
}

export function getTSConfig(options: StrykerOptions): ts.ParsedCommandLine | undefined {
  return options[CONFIG_KEY];
}

export function getProjectDirectory(options: StrykerOptions) {
  return path.dirname(options[CONFIG_KEY_FILE] || '.');
}

/**
 * Verifies that the installed version of typescript satisfies '>=2.4` and otherwise: throws an exception
 */
export function guardTypescriptVersion() {
  if (!semver.satisfies(ts.version, '>=2.4')) {
    throw new Error(
      `Installed typescript version ${ts.version} is not supported by stryker-typescript. Please install version 2.5 or higher (\`npm install typescript@^2.5\`).`
    );
  }
}

const printer = ts.createPrinter({
  newLine: os.EOL === '\r\n' ? ts.NewLineKind.CarriageReturnLineFeed : ts.NewLineKind.LineFeed,
  removeComments: false
});

export function printNode(node: ts.Node, originalSourceFile: ts.SourceFile): string {
  return printer.printNode(ts.EmitHint.Unspecified, node, originalSourceFile);
}

function tsExtensions() {
  // Since ts 2.5 the ts.Extension enum is a string-based enum
  if (semver.satisfies(ts.version, '>=2.5')) {
    return Object.keys(ts.Extension).map(extension => ts.Extension[extension as keyof typeof ts.Extension]);
  } else {
    // We know that pre 2.5 should have these extensions:
    return ['.ts', '.tsx', '.js', '.jsx'];
  }
}

export function isTypescriptFile(fileName: string) {
  return tsExtensions().some(extension => fileName.endsWith(extension));
}

export function isJavaScriptFile(file: ts.OutputFile) {
  return file.name.endsWith('.js') || file.name.endsWith('.jsx');
}

export function isMapFile(file: ts.OutputFile) {
  return file.name.endsWith('.map');
}

/**
 * Determines whether or not given file is a typescript header file (*.d.ts)
 */
export function isHeaderFile(fileName: string) {
  return fileName.endsWith('.d.ts');
}
