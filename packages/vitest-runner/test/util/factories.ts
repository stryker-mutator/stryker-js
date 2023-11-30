import sinon from 'sinon';
import { Vitest } from 'vitest/node';
import { File, Suite, Test } from 'vitest';

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
      getFiles: () => [] as File[],
    },
    projects: [] as Vitest['projects'],
    start: sinon.stub(),
  } as sinon.SinonStubbedInstance<Vitest>;
}

export function createSuite(overrides?: Partial<Suite>): Suite {
  return {
    id: '1',
    meta: {},
    mode: 'run',
    name: 'suite',
    tasks: [],
    type: 'suite',
    projectName: '',
    ...overrides,
  };
}

export function createVitestFile(overrides?: Partial<File>): File {
  return {
    projectName: '',
    name: 'file.js',
    filepath: 'file.spec.js',
    type: 'suite',
    id: '1',
    mode: 'run',
    tasks: [],
    meta: {},
    ...overrides,
  };
}

export function createVitestTest(overrides?: Partial<Test>): Test {
  return {
    type: 'test',
    suite: createSuite(),
    id: '1',
    name: 'test1',
    meta: {},
    mode: 'run',
    context: {} as any,
    file: createVitestFile(),
    ...overrides,
  };
}
