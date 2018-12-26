import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);
chai.use(chaiAsPromised);
beforeEach(() => {
  global.sandbox = sinon.createSandbox();
});
afterEach(() => {
  global.sandbox.restore();
});
