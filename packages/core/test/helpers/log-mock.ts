import logging from 'log4js';
import sinon from 'sinon';

import { logger } from './producers.js';

let log: sinon.SinonStubbedInstance<logging.Logger>;

beforeEach(() => {
  log = logger();
  sinon.stub(logging, 'getLogger').returns(log);
});

export function currentLogMock(): any {
  return log;
}
