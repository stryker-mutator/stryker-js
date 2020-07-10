import { promises as fs } from 'fs';
import path from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import { File } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';

import { Instrumenter } from '../../src';
import { createInstrumenterOptions } from '../helpers/factories';

const resolveTestResource = path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'instrumenter'
);

describe('instrumenter integration', () => {
  let sut: Instrumenter;
  beforeEach(() => {
    sut = testInjector.injector.injectClass(Instrumenter);
  });

  it('should be able to instrument html', async () => {
    await arrangeAndActAssert('html-sample.html');
  });
  it('should be able to instrument a simple js file', async () => {
    await arrangeAndActAssert('js-sample.js');
  });
  it('should be able to instrument a simple ts file', async () => {
    await arrangeAndActAssert('ts-sample.ts');
  });
  it('should be able to instrument an angular component', async () => {
    await arrangeAndActAssert('app.component.ts');
  });
  it('should be able to instrument a lit-html file', async () => {
    await arrangeAndActAssert('lit-html-sample.ts');
  });
  it('should be able to instrument a vue sample', async () => {
    await arrangeAndActAssert('vue-sample.vue');
  });

  async function arrangeAndActAssert(fileName: string, options = createInstrumenterOptions()) {
    const fullFileName = resolveTestResource(fileName);
    const file = new File(fullFileName, await fs.readFile(fullFileName));
    const result = await sut.instrument([file], options);
    expect(result.files).lengthOf(1);
    chaiJestSnapshot.setFilename(resolveTestResource(`${fileName}.out.snap`));
    expect(result.files[0].textContent).matchSnapshot();
  }
});
