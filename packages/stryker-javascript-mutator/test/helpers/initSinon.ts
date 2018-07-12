import * as sinon from 'sinon';
import * as logging from 'stryker-api/logging';
import LogMock from './LogMock';

beforeEach(() => {
  global.sandbox = sinon.createSandbox();
  global.logMock = new LogMock();
  global.sandbox.stub(logging, 'getLogger').returns(global.logMock);
});

afterEach(() => {
  global.sandbox.restore();
});