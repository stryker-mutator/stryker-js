import { promises as fsPromises } from 'fs';

import { expect } from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';

import { File } from '@stryker-mutator/api/core';

import { disableTypeChecks } from '../../src';
import { createInstrumenterOptions } from '../helpers/factories';
import { resolveTestResource } from '../helpers/resolve-test-resource';

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
    const file = new File(fullFileName, await fsPromises.readFile(fullFileName));
    const result = await disableTypeChecks(file, options);
    chaiJestSnapshot.setFilename(resolveTestResource('disable-type-checks', `${fileName}.out.snap`));
    expect(result.textContent).matchSnapshot();
  }
});
