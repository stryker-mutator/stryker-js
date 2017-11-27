import * as sinon from 'sinon';
import * as log4js from 'log4js';
import LogMock from './LogMock';

beforeEach(() => {
  global.sandbox = sinon.createSandbox();
  global.logMock = new LogMock();
  global.sandbox.stub(log4js, 'getLogger').returns(global.logMock);
});

afterEach(() => {
  global.sandbox.restore();
});