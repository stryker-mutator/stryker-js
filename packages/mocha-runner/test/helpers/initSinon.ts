import { testInjector } from '@stryker-mutator/test-helpers';
import * as sinon from 'sinon';

import { StrykerMochaReporter } from '../../src/StrykerMochaReporter';

afterEach(() => {
  sinon.restore();
  testInjector.reset();
  StrykerMochaReporter.currentInstance = undefined;
  delete global.__currentTestId__;
  delete global.__mutantCoverage__;
  delete global.__activeMutant__;
});
