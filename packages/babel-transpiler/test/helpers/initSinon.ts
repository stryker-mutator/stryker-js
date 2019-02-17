import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import { testInjector } from '@stryker-mutator/test-helpers';
chai.use(chaiAsPromised);
chai.use(sinonChai);
afterEach(() => {
  testInjector.reset();
  sinon.restore();
});
