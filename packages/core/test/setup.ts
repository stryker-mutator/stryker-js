import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

use(chaiAsPromised);
use(sinonChai);

export const mochaHooks = {
  async afterEach(): Promise<void> {
    await testInjector.injector.dispose();
    sinon.restore();
    testInjector.reset();
  },
};
