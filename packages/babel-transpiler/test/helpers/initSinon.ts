import { testInjector } from '@stryker-mutator/test-helpers';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(chaiAsPromised);
chai.use(sinonChai);
afterEach(() => {
  testInjector.reset();
  sinon.restore();
});
