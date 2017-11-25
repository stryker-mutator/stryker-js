import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
chai.use(sinonChai);
beforeEach(() => {
  global.sandbox = sinon.sandbox.create();
});
afterEach(() => {
  global.sandbox.restore();
});