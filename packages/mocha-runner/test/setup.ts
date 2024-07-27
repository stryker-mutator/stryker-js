import 'source-map-support/register.js';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { StrykerMochaReporter } from '../src/stryker-mocha-reporter.js';

use(sinonChai);
use(chaiAsPromised);

const cwd = process.cwd();

export const mochaHooks = {
  afterEach(): void {
    if (process.cwd() !== cwd) {
      process.chdir(cwd);
    }
    sinon.restore();
    testInjector.reset();
    StrykerMochaReporter.currentInstance = undefined;
    delete global.__stryker2__?.activeMutant;
    delete global.__stryker2__?.currentTestId;
    if (global.__stryker2__?.mutantCoverage?.perTest) {
      global.__stryker2__.mutantCoverage.perTest = {};
    }
    if (global.__stryker2__?.mutantCoverage?.static) {
      global.__stryker2__.mutantCoverage.static = {};
    }
  },
};
