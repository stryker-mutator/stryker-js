import * as log4js from 'log4js';
import * as sinon from 'sinon';
import { logger } from './producers';

const log = logger();

if ((global as any).log4jsSandbox) {
  (global as any).log4jsSandbox.restore();
}

let sandbox: sinon.SinonSandbox;
(global as any).log4jsSandbox = sandbox = sinon.sandbox.create();

// Stub away even before other files are loaded and tests have started
sandbox.stub(log4js, 'getLogger').returns(log);

beforeEach(() => {
  log.trace.reset();
  log.debug.reset();
  log.info.reset();
  log.warn.reset();
  log.error.reset();
  log.fatal.reset();
});

after(() => {
  // Restore for next (stryker) test run
  sandbox.restore();
  (global as any).log4jsSandbox = null;
});

export default log;