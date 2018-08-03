import * as logging from 'stryker-api/logging';
import { logger, Mock } from './producers';

let log: Mock<logging.Logger>;

beforeEach(() => {
  log = logger();
  sandbox.stub(logging, 'getLogger').returns(log);
});

export default function currentLogMock() {
  return log;
}