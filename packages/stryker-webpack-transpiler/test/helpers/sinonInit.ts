import * as sinon from 'sinon';
import * as logging from 'stryker-api/logging';

beforeEach(() => {
  global.sandbox = sinon.sandbox.create();
  global.logMock = {
    debug: sandbox.stub(),
    info: sandbox.stub(),
    warn: sandbox.stub(),
    error: sandbox.stub()
  };
  sandbox.stub(logging, 'getLogger').returns(global.logMock);
});

afterEach(() => {
  global.sandbox.restore();
});