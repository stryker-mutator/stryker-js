import sinon from 'sinon';
import { Vitest } from 'vitest/node';
import type { RunnerTestFile, RunnerTestSuite, RunnerTestCase } from 'vitest';

type ResolvedConfig = Vitest['config'];
type ResolvedBrowserOptions = ResolvedConfig['browser'];

export function createVitestMock(): sinon.SinonStubbedInstance<Vitest> {
  return {
    config: {
      browser: {
        enabled: false,
        headless: false,
      } as ResolvedBrowserOptions,
    } as ResolvedConfig,
    state: {
      filesMap: new Map(),
      getFiles: () => [] as RunnerTestFile[],
    },
    projects: [] as Vitest['projects'],
    start: sinon.stub(),
  } as sinon.SinonStubbedInstance<Vitest>;
}

export function createSuite(overrides?: Partial<RunnerTestSuite>): RunnerTestSuite {
  return {
    id: '1',
    meta: {},
    mode: 'run',
    name: 'suite',
    tasks: [],
    type: 'suite',
    file: createVitestFile(),
    ...overrides,
  };
}

export function createVitestFile(overrides?: Partial<Omit<RunnerTestFile, 'file'>>): RunnerTestFile {
  const file = {
    projectName: '',
    name: 'file.js',
    filepath: 'file.spec.js',
    type: 'suite',
    id: '1',
    mode: 'run',
    tasks: [],
    meta: {},
    ...overrides,
  } as RunnerTestFile;
  file.file = file;
  return file;
}

export function createVitestTest(overrides?: Partial<RunnerTestCase>): RunnerTestCase {
  return {
    type: 'test',
    suite: createSuite(),
    id: '1',
    name: 'test1',
    meta: {},
    mode: 'run',
    timeout: 0,
    context: {} as any,
    file: createVitestFile(),
    ...overrides,
  };
}
