import 'source-map-support/register.js';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const mochaHooks = {
  async afterEach(): Promise<void> {
    await testInjector.injector.dispose();
    sinon.restore();
    testInjector.reset();
  },
};
