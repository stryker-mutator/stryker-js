import 'source-map-support/register';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const mochaHooks = {
  afterEach() {
    sinon.restore();
    testInjector.reset();
  },
};
