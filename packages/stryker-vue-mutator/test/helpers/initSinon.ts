import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
chai.use(chaiAsPromised);
chai.use(sinonChai);
beforeEach(() => {
  global.sandbox = sinon.sandbox.create();
});
afterEach(() => {
  global.sandbox.restore();
});