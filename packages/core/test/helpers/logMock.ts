import * as logging from 'log4js';
import * as sinon from 'sinon';

import { logger, Mock } from './producers';

let log: Mock<logging.Logger>;

beforeEach(() => {
  log = logger();
  sinon.stub(logging, 'getLogger').returns(log);
});

export default function currentLogMock() {
  return log;
}
