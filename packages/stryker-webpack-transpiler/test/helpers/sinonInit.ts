import * as sinon from 'sinon';
import * as log4js from 'log4js';

beforeEach(() => {
  global.sandbox = sinon.sandbox.create();
  global.logMock = {
    debug: sandbox.stub(),
    info: sandbox.stub(),
    warn: sandbox.stub(),
    error: sandbox.stub()
  };
  sandbox.stub(log4js, 'getLogger').returns(global.logMock);
});

afterEach(() => {
  global.sandbox.restore();
});