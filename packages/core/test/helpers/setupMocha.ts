import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';
import 'source-map-support/register';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const mochaHooks = {
  before() {
    console.log('BEFORE ALL!');
  },
  afterEach() {
    sinon.restore();
    testInjector.reset();
  },
};
