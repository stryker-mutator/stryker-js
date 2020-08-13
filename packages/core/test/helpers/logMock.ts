import * as logging from 'log4js';
import sinon from 'sinon';

import { logger, Mock } from './producers';

let log: Mock<logging.Logger>;

beforeEach(() => {
  log = logger();
  sinon.stub(logging, 'getLogger').returns(log);
});

export function currentLogMock() {
  return log;
}
