import 'source-map-support/register';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { StrykerMochaReporter } from '../../src/StrykerMochaReporter';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const cwd = process.cwd();

afterEach(() => {
  if (process.cwd() !== cwd) {
    process.chdir(cwd);
  }
  sinon.restore();
  testInjector.reset();
  StrykerMochaReporter.currentInstance = undefined;
  delete global.__currentTestId__;
  delete global.__mutantCoverage__;
  delete global.__activeMutant__;
});
