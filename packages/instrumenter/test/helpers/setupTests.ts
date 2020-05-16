import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

chai.use(sinonChai);
chai.use(chaiAsPromised);

afterEach(() => {
  sinon.restore();
  testInjector.reset();
});
