import { promises as fsPromises } from 'fs';

import { expect } from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';

import { disableTypeChecks, File } from '../../src/index.js';
import { createInstrumenterOptions } from '../helpers/factories.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe(`${disableTypeChecks.name} integration`, () => {
  it('should be able disable type checks of a typescript file', async () => {
    await arrangeAndActAssert('app.component.ts');
  });
  it('should be able disable type checks of an html file', async () => {
    await arrangeAndActAssert('html-sample.html');
  });
  it('should be able disable type checks of a vue file', async () => {
    await arrangeAndActAssert('vue-sample.vue');
  });
  it('should be able disable type checks of a vue tsx file', async () => {
    await arrangeAndActAssert('vue-tsx-sample.vue');
  });

  async function arrangeAndActAssert(fileName: string, options = createInstrumenterOptions()) {
    const fullFileName = resolveTestResource('disable-type-checks', fileName);
    const file: File = { name: fullFileName, content: await fsPromises.readFile(fullFileName, 'utf-8'), mutate: true };
    const result = await disableTypeChecks(file, options);
    chaiJestSnapshot.setFilename(resolveTestResource('disable-type-checks', `${fileName}.out.snap`));
    expect(result.content).matchSnapshot();
  }
});
