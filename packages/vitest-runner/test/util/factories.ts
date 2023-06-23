import sinon from 'sinon';
import { Vitest } from 'vitest/node';
import { File } from 'vitest';

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
