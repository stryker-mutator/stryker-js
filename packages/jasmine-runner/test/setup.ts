import 'source-map-support/register';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import * as sinon from 'sinon';
import { INSTRUMENTER_CONSTANTS } from '@stryker-mutator/api/core';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const mochaHooks = {
  afterEach() {
    delete global[INSTRUMENTER_CONSTANTS.NAMESPACE]?.activeMutant;
    delete global[INSTRUMENTER_CONSTANTS.NAMESPACE]?.currentTestId;
    delete global[INSTRUMENTER_CONSTANTS.NAMESPACE]?.mutantCoverage;
    global.__testsInCurrentJasmineRun = [];

    sinon.restore();
    testInjector.reset();
  },
};
