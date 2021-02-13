import 'source-map-support/register';
import { testInjector } from '@stryker-mutator/test-helpers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const mochaHooks = {
  afterEach(): void {
    delete global.__stryker2__?.activeMutant;
    delete global.__stryker2__?.currentTestId;
    delete global.__stryker2__?.mutantCoverage;
    global.__testsInCurrentJasmineRun = [];

    sinon.restore();
    testInjector.reset();
  },
};
