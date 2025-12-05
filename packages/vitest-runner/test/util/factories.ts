import sinon from 'sinon';
import type {
  RunnerTestCase,
  RunnerTestFile,
  RunnerTestSuite,
  Vitest,
} from 'vitest/node';
import { VitestRunnerOptions } from '../../src-generated/vitest-runner-options.js';

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
      errorsSet: new Set(),
    },
    projects: [] as Vitest['projects'],
    start: sinon.stub(),
    provide: sinon.stub(),
  } as sinon.SinonStubbedInstance<Vitest>;
}

export function createSuite(
  overrides?: Partial<RunnerTestSuite>,
): RunnerTestSuite {
  return {
    id: '1',
    meta: {},
    mode: 'run',
    fullName: 'test/suite-name.test.ts > suite-test',
    name: 'suite',
    tasks: [],
    type: 'suite',
    file: createVitestFile(),
    ...overrides,
  };
}

export function createVitestFile(
  overrides?: Partial<Omit<RunnerTestFile, 'file'>>,
): RunnerTestFile {
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

export function createVitestTest(
  overrides?: Partial<RunnerTestCase>,
): RunnerTestCase {
  return {
    type: 'test',
    suite: createSuite(),
    id: '1',
    fullTestName: 'suite-test > test1',
    fullName: 'test/suite-name.test.ts > suite-test > test1',
    name: 'test1',
    meta: {},
    mode: 'run',
    timeout: 0,
    context: {} as any,
    file: createVitestFile(),
    annotations: [],
    artifacts: [],
    ...overrides,
  };
}

export function createVitestRunnerOptions(
  overrides?: Partial<VitestRunnerOptions>,
): VitestRunnerOptions {
  return {
    related: true,
    ...overrides,
  };
}
