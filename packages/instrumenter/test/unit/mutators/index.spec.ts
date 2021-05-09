import fs from 'fs';
import path from 'path';

import { expect } from 'chai';

import { mutators } from '../../../src/mutators';

describe('mutators module', () => {
  it('should include all mutators', async () => {
    const resolveMutator = path.resolve.bind(path, __dirname, '..', '..', '..', 'src', 'mutators');

    const blackList = ['index.js', 'node-mutator.js', 'mutator-options.js'];
    const allMutators = await Promise.all(
      fs
        .readdirSync(resolveMutator())
        .filter((fileName) => fileName.endsWith('.js'))
        .filter((fileName) => !blackList.includes(fileName))
        .map(async (fileName) => {
          const mutatorModule = await import(resolveMutator(fileName));
          const keys = Object.keys(mutatorModule as Record<string, unknown>);
          if (keys.length > 1) {
            throw new Error(`File ${fileName} is exporting more than the mutator: ${keys.join(',')}`);
          }
          return mutatorModule[keys[0]];
        })
    );
    allMutators.forEach((Mutator) => {
      expect(
        mutators.find((mutator) => mutator instanceof Mutator),
        `${Mutator.name} is missing!`
      ).ok;
    });
  });
});
