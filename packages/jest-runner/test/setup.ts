import 'source-map-support/register';
import { testInjector } from '@stryker-mutator/test-helpers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { state } from '../src/messaging';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const initialCwd = process.cwd();
export const originalProcessExit = process.exit;

export const mochaHooks = {
  afterEach(): void {
    sinon.restore();
    testInjector.reset();
    process.chdir(initialCwd);
    process.exit = originalProcessExit;
    delete global.__stryker2__;
    state.coverageAnalysis = 'off';
    state.resetMutantCoverageHandler();
  },
};
