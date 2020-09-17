import path from 'path';
import { promises as fs } from 'fs';

import { expect } from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';

import { File } from '@stryker-mutator/api/core';

import { disableTypeChecks } from '../../src';
import { createInstrumenterOptions } from '../helpers/factories';

const resolveTestResource = path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'disable-type-checks'
);

describe(`${disableTypeChecks.name} integration`, () => {
  it('should be able disable type checks of a type script file', async () => {
    await arrangeAndActAssert('app.component.ts');
  });
  it('should be able disable type checks of an html file', async () => {
    await arrangeAndActAssert('html-sample.html');
  });
  it('should be able disable type checks of a vue file', async () => {
    await arrangeAndActAssert('vue-sample.vue');
  });

  async function arrangeAndActAssert(fileName: string, options = createInstrumenterOptions()) {
    const fullFileName = resolveTestResource(fileName);
    const file = new File(fullFileName, await fs.readFile(fullFileName));
    const result = await disableTypeChecks(file, options);
    chaiJestSnapshot.setFilename(resolveTestResource(`${fileName}.out.snap`));
    expect(result.textContent).matchSnapshot();
  }
});
