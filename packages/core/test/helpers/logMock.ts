import * as logging from 'log4js';
import { logger, Mock } from './producers';
import * as sinon from 'sinon';

let log: Mock<logging.Logger>;

beforeEach(() => {
  log = logger();
  sinon.stub(logging, 'getLogger').returns(log);
});

export default function currentLogMock() {
  return log;
}
