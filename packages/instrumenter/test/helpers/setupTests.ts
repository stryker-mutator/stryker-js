import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

chai.use(sinonChai);
chai.use(chaiAsPromised);

afterEach(() => {
  sinon.restore();
  testInjector.reset();
});
