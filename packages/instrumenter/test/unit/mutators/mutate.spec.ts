import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { expect } from 'chai';

import { allMutators, NodeMutator } from '../../../src/mutators/index.js';

describe('allMutators', () => {
  it('should include all mutators', async () => {
    const resolveMutator = path.resolve.bind(path, path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'src', 'mutators');
    const blackList = ['index.js', 'node-mutator.js', 'mutator-options.js', 'mutate.js'];
    const actualMutators = (await Promise.all(
      fs
        .readdirSync(resolveMutator())
        .filter((fileName) => fileName.endsWith('.js'))
        .filter((fileName) => !blackList.includes(fileName))
        .map(async (fileName) => {
          const mutatorModule = (await import(resolveMutator(fileName))) as Record<string, unknown>;
          const keys = Object.keys(mutatorModule);
          if (keys.length > 1) {
            throw new Error(`File ${fileName} is exporting more than the mutator: ${keys.join(',')}`);
          }
          return mutatorModule[keys[0]];
        })
    )) as NodeMutator[];
    actualMutators.forEach((mutator) => {
      expect(allMutators.includes(mutator), `${mutator.name} is missing!`).ok;
    });
  });
});
