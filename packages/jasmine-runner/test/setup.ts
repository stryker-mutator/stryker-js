import 'source-map-support/register.js';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

use(sinonChai);
use(chaiAsPromised);

export const mochaHooks = {
  afterEach(): void {
    delete global.__stryker2__?.activeMutant;
    delete global.__stryker2__?.currentTestId;
    delete global.__stryker2__?.mutantCoverage;

    sinon.restore();
    testInjector.reset();
  },
};
