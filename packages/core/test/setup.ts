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
    sinon.restore();
    testInjector.reset();
  },
};
