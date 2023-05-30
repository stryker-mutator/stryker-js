import sinon from 'sinon';
import { Vitest } from 'vitest/node';

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
    start: sinon.stub(),
  } as sinon.SinonStubbedInstance<Vitest>;
}
