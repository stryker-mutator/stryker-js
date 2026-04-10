import { createRequire } from 'module';
import { pathToFileURL } from 'node:url';
import path from 'path';
import { createVitest as createVitestOriginal } from 'vitest/node';

// Try to load the project's local Vitest installation
let createVitest = createVitestOriginal;
let version: string;

try {
  const require = createRequire(path.join(process.cwd(), 'package.json'));

  const vitestNodePath = require.resolve('vitest/node');
  const vitestNode = await import(pathToFileURL(vitestNodePath).href);
  createVitest = vitestNode.createVitest ?? createVitestOriginal;

  version = require(require.resolve('vitest/package.json')).version;
} catch {
  const require = createRequire(import.meta.url);
  version = require(require.resolve('vitest/package.json')).version;
}

export const vitestWrapper = {
  createVitest,
  version,
};

export type * from 'vitest/node';
