import { promises as fsPromises } from 'fs';
import { createRequire } from 'module';
import os from 'os';
import path from 'path';

import { INSTRUMENTER_CONSTANTS as ID } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createInstrumenter, File, Instrumenter } from '../../src/index.js';
import { createInstrumenterOptions } from '../helpers/factories.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

const requireSideEffectCountKey = '__strykerRequireSideEffectCount__';

describe('require side effects', () => {
  let sut: Instrumenter;

  beforeEach(() => {
    sut = testInjector.injector.injectFunction(createInstrumenter);
  });

  it('should preserve require side effects when no mutant is active', async () => {
    const { content } = await instrumentMainFile();

    const sideEffectCount = await executeInstrumentedMain(content);

    expect(sideEffectCount).eq(1);
  });

  it('should not have any require side effects when the require call mutant is active', async () => {
    const { content, mutantId, mutatorName } = await instrumentMainFile();

    expect(mutatorName).eq('CallExpression');

    const sideEffectCount = await executeInstrumentedMain(content, mutantId);

    expect(sideEffectCount).eq(0);
  });

  async function instrumentMainFile() {
    const fileName = resolveTestResource('require-side-effects', 'main.js');
    const file: File = {
      name: fileName,
      mutate: true,
      content: await fsPromises.readFile(fileName, 'utf-8'),
    };

    const result = await sut.instrument([file], createInstrumenterOptions());

    expect(result.files).lengthOf(1);
    expect(result.mutants).lengthOf(1);

    return {
      content: result.files[0].content,
      mutantId: result.mutants[0].id,
      mutatorName: result.mutants[0].mutatorName,
    };
  }

  async function executeInstrumentedMain(
    instrumentedContent: string,
    activeMutant?: string,
  ) {
    const tempDir = await fsPromises.mkdtemp(
      path.join(os.tmpdir(), 'stryker-require-side-effects-'),
    );
    const tempMainFileName = path.join(tempDir, 'main.js');
    const tempGlobalFileName = path.join(tempDir, 'global.js');
    const globalObject = globalThis as typeof globalThis &
      Record<string, unknown>;
    const hadNamespace = Object.prototype.hasOwnProperty.call(
      globalObject,
      ID.NAMESPACE,
    );
    const hadSideEffectCount = Object.prototype.hasOwnProperty.call(
      globalObject,
      requireSideEffectCountKey,
    );
    const previousNamespace = globalObject[ID.NAMESPACE];
    const previousSideEffectCount = globalObject[requireSideEffectCountKey];

    try {
      if (activeMutant) {
        globalObject[ID.NAMESPACE] = { [ID.ACTIVE_MUTANT]: activeMutant };
      } else {
        delete globalObject[ID.NAMESPACE];
      }
      globalObject[requireSideEffectCountKey] = 0;

      await Promise.all([
        fsPromises.writeFile(tempMainFileName, instrumentedContent),
        fsPromises.copyFile(
          resolveTestResource('require-side-effects', 'global.js'),
          tempGlobalFileName,
        ),
      ]);

      const tempRequire = createRequire(tempMainFileName);

      tempRequire('./main.js');

      return globalObject[requireSideEffectCountKey];
    } finally {
      if (hadNamespace) {
        globalObject[ID.NAMESPACE] = previousNamespace;
      } else {
        delete globalObject[ID.NAMESPACE];
      }

      if (hadSideEffectCount) {
        globalObject[requireSideEffectCountKey] = previousSideEffectCount;
      } else {
        delete globalObject[requireSideEffectCountKey];
      }

      await fsPromises.rm(tempDir, { recursive: true, force: true });
    }
  }
});
