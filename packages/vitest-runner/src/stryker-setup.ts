import { MutantCoverage } from '@stryker-mutator/api/core';
import { MutantActivation } from '@stryker-mutator/api/test-runner';
import { beforeEach, afterAll, beforeAll, afterEach, inject } from 'vitest';
import { toRawTestId } from './test-helpers.js';

const globalNamespace = inject('globalNamespace');
const mutantActivation = inject('mutantActivation');
const mode = inject('mode');

const ns = globalThis[globalNamespace] || (globalThis[globalNamespace] = {});
ns.hitLimit = inject('hitLimit');
debugger;

if (mode === 'mutant') {
  beforeAll(() => {
    ns.hitCount = 0;
  });

  if (mutantActivation === 'static') {
    ns.activeMutant = inject('activeMutant');
  } else {
    beforeAll(() => {
      ns.activeMutant = inject('activeMutant');
    });
  }
  afterAll((suite) => {
    suite.meta.hitCount = ns.hitCount;
  });
} else {
  ns.activeMutant = undefined;

  beforeEach((test) => {
    ns.currentTestId = toRawTestId(test.task);
  });

  afterEach(() => {
    ns.currentTestId = undefined;
  });

  afterAll((suite) => {
    suite.meta.mutantCoverage = ns.mutantCoverage;
  });
}

declare module 'vitest' {
  interface ProvidedContext {
    globalNamespace: '__stryker__' | '__stryker2__';
    hitLimit: number | undefined;
    mutantActivation: MutantActivation;
    activeMutant: string | undefined;
    mode: 'mutant' | 'dry-run';
  }
  interface TaskMeta {
    hitCount: number | undefined;
    mutantCoverage: MutantCoverage | undefined;
  }
}
