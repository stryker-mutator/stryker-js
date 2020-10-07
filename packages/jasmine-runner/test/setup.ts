import 'source-map-support/register';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import * as sinon from 'sinon';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const mochaHooks = {
  afterEach() {
    delete global.__stryker2__?.activeMutant;
    delete global.__stryker2__?.currentTestId;
    delete global.__stryker2__?.mutantCoverage;
    global.__testsInCurrentJasmineRun = [];

    sinon.restore();
    testInjector.reset();
  },
};
