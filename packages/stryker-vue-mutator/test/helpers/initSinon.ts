import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
chai.use(sinonChai);
beforeEach(() => {
  global.sandbox = sinon.sandbox.create();
});
afterEach(() => {
  global.sandbox.restore();
});