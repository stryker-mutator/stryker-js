import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { expect } from 'chai';

import { createAllMutators, NodeMutator } from '../../../src/mutators/index.js';
import { SvelteTemplateExpressionContext } from '../../../src/frameworks/svelte-template-expression-context.js';

type NodeMutatorClass = new (...args: unknown[]) => NodeMutator;

function isNodeMutatorObject(value: unknown): value is NodeMutator {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'mutate' in value &&
    typeof value.name === 'string' &&
    typeof value.mutate === 'function'
  );
}

function isNodeMutatorClass(value: unknown): value is NodeMutatorClass {
  return (
    typeof value === 'function' &&
    'prototype' in value &&
    typeof value.prototype === 'object' &&
    value.prototype !== null &&
    'mutate' in value.prototype &&
    typeof value.prototype.mutate === 'function'
  );
}

describe('createAllMutators', () => {
  it('should include all mutators', async () => {
    const allMutators = createAllMutators(
      new SvelteTemplateExpressionContext(),
    );

    const resolveMutator = path.resolve.bind(
      path,
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      '..',
      'src',
      'mutators',
    );
    const blackList = [
      'index.js',
      'node-mutator.js',
      'mutator-options.js',
      'mutate.js',
    ];
    const actualMutators = await Promise.all(
      fs
        .readdirSync(resolveMutator())
        .filter((fileName) => fileName.endsWith('.js'))
        .filter((fileName) => !blackList.includes(fileName))
        .map(async (fileName) => {
          const mutatorModule = (await import(
            pathToFileURL(resolveMutator(fileName)).toString()
          )) as Record<string, unknown>;
          const keys = Object.keys(mutatorModule);
          if (keys.length > 1) {
            throw new Error(
              `File ${fileName} is exporting more than the mutator: ${keys.join(',')}`,
            );
          }
          const exportName = keys[0];
          return { exportName, mutator: mutatorModule[exportName] };
        }),
    );

    const expectedMutatorNames = actualMutators.map(({ mutator }) => {
      if (isNodeMutatorObject(mutator)) {
        return mutator.name;
      }
      if (isNodeMutatorClass(mutator)) {
        const instance = allMutators.find((m) => m.constructor === mutator);
        if (instance) {
          return instance.name;
        }
      }
      throw new Error('Unknown mutator export shape');
    });
    const actualMutatorNames = allMutators.map((mutator) => mutator.name);

    expectedMutatorNames.forEach((name) => {
      expect(actualMutatorNames).includes(name, `${name} is missing!`);
    });
  });
});
