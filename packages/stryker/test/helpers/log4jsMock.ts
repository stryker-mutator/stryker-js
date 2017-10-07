import * as log4js from 'log4js';
import { logger, Mock } from './producers';

let log: Mock<log4js.Logger>;

beforeEach(() => {
  log = logger();
  sandbox.stub(log4js, 'getLogger').returns(log);
});

export default function currentLogMock() {
  return log;
}