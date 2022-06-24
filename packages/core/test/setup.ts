import 'source-map-support/register.js';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const mochaHooks = {
  async afterEach(): Promise<void> {
    await testInjector.injector.dispose();
    sinon.restore();
    testInjector.reset();
  },
};
