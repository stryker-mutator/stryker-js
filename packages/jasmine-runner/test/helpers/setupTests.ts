import 'source-map-support/register';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

chai.use(sinonChai);
chai.use(chaiAsPromised);

afterEach(() => {
  delete global.__activeMutant__;
  delete global.__currentTestId__;
  delete global.__mutantCoverage__;
  delete global.__testsInCurrentJasmineRun;

  sinon.restore();
  testInjector.reset();
});
