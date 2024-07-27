import 'source-map-support/register.js';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

import { state } from '../src/jest-plugins/messaging.cjs';

use(sinonChai);
use(chaiAsPromised);
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
    state.clear();
  },
};
