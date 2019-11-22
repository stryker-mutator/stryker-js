import { testInjector } from '@stryker-mutator/test-helpers';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.use(chaiAsPromised);
chai.use(sinonChai);
afterEach(() => {
  sinon.restore();
  testInjector.reset();
});
