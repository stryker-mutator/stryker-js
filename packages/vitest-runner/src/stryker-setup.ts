import type { MutantCoverage } from '@stryker-mutator/api/core';
import type { MutantActivation } from '@stryker-mutator/api/test-runner';
import {
  beforeEach,
  afterAll,
  beforeAll,
  afterEach,
  inject,
  RunnerTestSuite,
  RunnerTestCase,
} from 'vitest';

// This file is copied to the sandbox dir, don't import anything local!
// See https://github.com/stryker-mutator/stryker-js/issues/5305

const globalNamespace = inject('globalNamespace');
const mutantActivation = inject('mutantActivation');
const mode = inject('mode');

const ns = globalThis[globalNamespace] || (globalThis[globalNamespace] = {});
ns.hitLimit = inject('hitLimit');

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

// Stryker disable all: this file is copied to the sandbox dir
function collectTestName({
  name,
  suite,
}: {
  name: string;
  suite?: RunnerTestSuite;
}): string {
  const nameParts = [name];
  let currentSuite = suite;
  while (currentSuite) {
    nameParts.unshift(currentSuite.name);
    currentSuite = currentSuite.suite;
  }
  return nameParts.join(' ').trim();
}

function toRawTestId(test: RunnerTestCase): string {
  return `${test.file?.filepath ?? 'unknown.js'}#${collectTestName(test)}`;
}
// Stryker restore all

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
